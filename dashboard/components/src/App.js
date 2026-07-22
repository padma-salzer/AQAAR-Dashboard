import React, { useState, useEffect, useRef } from "react";
import { requestJira, router } from "@forge/bridge";
import { formatDate, formatDateForInput } from "./utils/dateUtils";
import { getStatusColor } from "./utils/colorUtils";
import FilterSection from "./components/FilterSection";
import StatusDonut from "./components/StatusDonut";
import ActiveStatusDonut from "./components/ActiveStatusDonut";
import SlaSection from "./components/SlaSection";
import TicketBarChart from "./components/TicketBarChart";
import TicketTable from "./components/TicketTable";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";
import salzerLogo from "./assets/salzer-logo.png";
import {
  card,
  sectionTitle,
  subText,
  divider,
  thStyle,
  tdStyle,
} from "./utils/styles";
import "@atlaskit/css-reset";

const App = () => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  //const formatDateForInput = (date) => date.toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(formatDateForInput(firstDayOfMonth));
  const [toDate, setToDate] = useState(formatDateForInput(today));
  const [chartData, setChartData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [statusData, setStatusData] = useState([]);
  const [issues, setTickets] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [totalTickets, setTotalTickets] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [slaData, setSlaData] = useState([]);
  const [openStatusData, setOpenStatusData] = useState([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [projectStatusFilter, setProjectStatusFilter] = useState(["Active"]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [isProjectLoading, setIsProjectLoading] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);
  const [hasSLAConfigured, setHasSLAConfigured] = useState(true);
  //const [totalStatusTickets, setTotalStatusTickets] = useState(0);

  const hasResolutionData =
    (slaData[0]?.count || 0) + (slaData[1]?.count || 0) > 0;

  const hasResponseData =
    (slaData[2]?.count || 0) + (slaData[3]?.count || 0) > 0;

  const pageSize = 10;
  const maxCount = Math.max(...chartData.map((item) => item.count), 1);

  const handleProjectStatusChange = (status) => {
    setProjectStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };
  const PAGE_MARGIN = 10;
  const LEFT_MARGIN = 20;
  const RIGHT_MARGIN = 20;
  // helper function to add border to pdf
  const addPageBorder = (doc) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(180);
    doc.setLineWidth(0.3);

    doc.rect(
      PAGE_MARGIN,
      PAGE_MARGIN,
      pageWidth - (PAGE_MARGIN * 2),
      pageHeight - (PAGE_MARGIN * 2)
    );
  };
  
  // helper function to add header to pdf
  const addHeader = (doc) => {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Report Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Jira Dashboard Report", LEFT_MARGIN, 18);

    // Company Logo
    doc.addImage(
      salzerLogo,
      "PNG",
      pageWidth - 45,
      12,
      35,
      9
    );

    // Header Line
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.line(
      LEFT_MARGIN - 5,
      25,
      pageWidth - RIGHT_MARGIN,
      25
    );
  };

  // add footer helper function
  const addFooter = (doc, pageNumber, totalPages) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);

    const pageText = `Page ${pageNumber} of ${totalPages}`;
    const textWidth = doc.getTextWidth(pageText);

    doc.text(pageText, pageWidth - textWidth - 15, pageHeight - 10);
  };

  // Export pdf button
  const handleExportPDF = async () => {

    const selectedProjectObj = projects.find(
      (project) => project.key === selectedProject
    );

    const projectName = selectedProjectObj
      ? selectedProjectObj.name
      : selectedProject;

    //Donut Charts
    const donutElement = document.getElementById("status-donut");
    const canvas = await html2canvas(donutElement);
    const image = canvas.toDataURL("image/png");

    // Active Status Donut
    const activeElement = document.getElementById("active-status-donut");
    const activeCanvas = await html2canvas(activeElement);
    const activeImage = activeCanvas.toDataURL("image/png");
    // SLA Section
    const slaElement = document.getElementById("sla-section");
    const slaCanvas = await html2canvas(slaElement);
    const slaImage = slaCanvas.toDataURL("image/png");
    const imgWidth = 170;

    //PDF
    const allTickets = await fetchAllTickets();
    const tableRows = allTickets.map((issue) => [
      issue.key,
      issue.fields.summary,
      issue.fields.assignee?.displayName || "Unassigned",
      issue.fields.status.name,
      new Date(issue.fields.created).toLocaleDateString(),
    ]);


    const doc = new jsPDF();
    addPageBorder(doc);
    addHeader(doc);
    let y = 35;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Project: ${projectName}`, LEFT_MARGIN, y);
    y += 10;
    doc.text(`From Date: ${fromDate}`, LEFT_MARGIN, y);
    doc.text(`To Date: ${toDate}`, 110, y);
    y += 10;
  
    //Donut Charts
    const statusHeight = (canvas.height * imgWidth) / canvas.width;
    doc.addImage(image, "PNG", 20, y, imgWidth, statusHeight);
    y += statusHeight + 10;
  
    // Active Status Donut
    const activeHeight =
      (activeCanvas.height * imgWidth) / activeCanvas.width;
    doc.addImage(activeImage, "PNG", 20, y, imgWidth, activeHeight);
    y += activeHeight + 10;
    // SLA Section
    doc.addPage();
    addPageBorder(doc);
    addHeader(doc);
    const slaHeight = (slaCanvas.height * imgWidth) / slaCanvas.width;
    doc.addImage(slaImage, "PNG", 20, 30, imgWidth, slaHeight);
    y += activeHeight + 10;
    let tableStartY = 30 + slaHeight + 20;
    doc.setFontSize(16);
    doc.text("Ticket Details", 20, tableStartY);
    autoTable(doc, {
      startY: tableStartY + 6,
      head: [[
        "Key",
        "Summary",
        "Assignee",
        "Status",
        "Created"
      ]],
      body: tableRows,
      didDrawPage: () => {
        addPageBorder(doc);
        addHeader(doc);
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: "middle",
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
    });
    const totalPages = doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(doc, i, totalPages);
    }
    doc.save("Jira_Dashboard_Report.pdf");
  };

  // Fetch all tickets for pdf table export
  const fetchAllTickets = async () => {
    let jql = `statusCategory != Done AND status NOT IN ("Closed","Resolved","Canceled")`;
    if (selectedProject) {
        jql += ` AND project = "${selectedProject}"`;
    }
    let allTickets = [];
    let nextPageToken = null;
    do {
        const body = {
            jql,
            maxResults: 100,
            fields: [
                "summary",
                "assignee",
                "status",
                "created"
            ],
        };
        if (nextPageToken) {
            body.nextPageToken = nextPageToken;
        }
        const response = await requestJira("/rest/api/3/search/jql", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!data.issues) break;
        allTickets.push(...data.issues);
        nextPageToken = data.nextPageToken;
    } while (nextPageToken);
    return allTickets;
};

  // Function to handle status filter click for open issues
  const fetchOpenStatusSummary = async () => {
    try {
      let jql = `statusCategory != Done AND status NOT IN ("Closed","Resolved","Canceled")`;

      if (selectedProject) {
        jql += ` AND project = "${selectedProject}"`;
      }

      let allTickets = [];
      let nextPageToken = null;

      do {
        const body = {
          jql,
          maxResults: 100,
          fields: ["status"],
        };

        if (nextPageToken) {
          body.nextPageToken = nextPageToken;
        }

        const response = await requestJira(`/rest/api/3/search/jql`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();
        if (!data.issues) break;

        allTickets = [...allTickets, ...data.issues];
        nextPageToken = data.nextPageToken;
      } while (nextPageToken);

      // Dynamic grouping
      const grouped = {};

      allTickets.forEach((issue) => {
        const status = issue.fields.status.name;
        const category = issue.fields.status.statusCategory.name;

        if (!grouped[status]) {
          grouped[status] = {
            count: 0,
            category,
          };
        }

        grouped[status].count += 1;
      });

      const formatted = Object.keys(grouped).map((status) => ({
        label: status,
        count: grouped[status].count,
        category: grouped[status].category,
      }));

      formatted.sort((a, b) => b.count - a.count);

      setOpenStatusData(formatted);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch issues based on date range and selected project
  const fetchIssueData = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both dates");
      return;
    }

    try {
      let jql = `created >= "${fromDate}" AND created <= "${toDate} 23:59"`;

      if (selectedProject) {
        jql += ` AND project = "${selectedProject}"`;
      }

      let allTickets = [];
      let nextPageToken = null;

      do {
        const body = {
          jql,
          maxResults: 100,
          fields: ["created"],
        };

        if (nextPageToken) {
          body.nextPageToken = nextPageToken;
        }

        const response = await requestJira(`/rest/api/3/search/jql`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!data.issues) break;

        allTickets = [...allTickets, ...data.issues];
        nextPageToken = data.nextPageToken;
      } while (nextPageToken);

      // Group by Date
      const grouped = {};

      allTickets.forEach((issue) => {
        const date = new Date(issue.fields.created).toLocaleDateString("en-CA");

        grouped[date] = (grouped[date] || 0) + 1;
      });

      const formatted = Object.keys(grouped)
        .sort()
        .map((date) => ({
          date,
          count: grouped[date],
        }));

      setChartData(formatted);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch list of projects for dropdown
  useEffect(() => {
    const loadProjects = async () => {
      setIsProjectLoading(true);

      try {
        const response = await requestJira(`/rest/api/3/project/search`, {
          headers: { Accept: "application/json" },
        });

        const data = await response.json();
        const projects = data.values || [];

        setAllProjects(projects);
      } catch (e) {
        console.error(e);
      } finally {
        setIsProjectLoading(false);
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    if (!allProjects.length) return;

    const filtered =
      projectStatusFilter.length === 0
        ? allProjects
        : allProjects.filter((project) => {
          const category = project.projectCategory?.name;
          return category && projectStatusFilter.includes(category);
        });

    // ADD THIS FILTER
    const jiraOnly = filtered.filter(
      (project) => project.projectTypeKey === "software"
    );

    //SORT
    const sorted = [...jiraOnly].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    setProjects(sorted);

    const isValidSelection = sorted.some((p) => p.key === selectedProject);

    if (!isValidSelection) {
      const defaultProject = sorted.find((project) => project.key === "PISD");

      if (defaultProject) {
        setSelectedProject(defaultProject.key);
      } else if (sorted.length > 0) {
        setSelectedProject(sorted[0].key);
      } else {
        setSelectedProject("");
      }
    }
  }, [projectStatusFilter, allProjects]);

  useEffect(() => {
    if (selectedProject && isFirstLoad) {
      fetchTotalTickets();
      fetchIssueData();
      fetchStatusData();
      fetchOpenTickets();
      fetchSLAData();
      fetchOpenStatusSummary();
      setIsFirstLoad(false);
    }
  }, [selectedProject]);

  // Fetch issue counts by status for the selected date range and project
  const fetchStatusData = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both dates");
      return;
    }

    try {
      let jql = `created >= "${fromDate}" AND created <= "${toDate} 23:59"`;

      if (selectedProject) {
        jql += ` AND project = "${selectedProject}"`;
      }

      let allTickets = [];
      let nextPageToken = null;

      do {
        const body = {
          jql,
          maxResults: 100,
          fields: ["status"],
        };

        if (nextPageToken) {
          body.nextPageToken = nextPageToken;
        }

        const response = await requestJira(`/rest/api/3/search/jql`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!data.issues) {
          console.error("No issues returned:", data);
          return;
        }

        allTickets = [...allTickets, ...data.issues];
        nextPageToken = data.nextPageToken;
      } while (nextPageToken);

      // Group by status
      const grouped = {};

      allTickets.forEach((issue) => {
        const statusName = issue.fields.status.name;
        const category = issue.fields.status.statusCategory.name;

        if (!grouped[statusName]) {
          grouped[statusName] = {
            count: 0,
            category,
          };
        }

        grouped[statusName].count += 1;
      });

      const formatted = Object.keys(grouped).map((status) => ({
        status,
        count: grouped[status].count,
        category: grouped[status].category,
      }));

      formatted.sort((a, b) => b.count - a.count);

      setStatusData(formatted);
    } catch (error) {
      console.error("Error fetching status data:", error);
    }
  };

  // Total Count
  const fetchTotalTickets = async () => {
    try {
      let jql = `created >= "${fromDate}" AND created <= "${toDate} 23:59" AND statusCategory IN ("To Do","In Progress")`;

      if (selectedProject) {
        jql += ` AND project = "${selectedProject}"`;
      }

      const response = await requestJira(`/rest/api/3/search/jql`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jql,
          maxResults: 0,
          fields: [],
        }),
      });

      const data = await response.json();

      console.log("Total Tickets Response:", data);

      if (data.total !== undefined) {
        setTotalTickets(data.total);
      }
    } catch (error) {
      console.error("Error fetching total issues:", error);
    }
  };

  // list view
  const fetchOpenTickets = async (token = null) => {
    try {
      let jql = `statusCategory != Done AND status NOT IN ("Closed","Resolved","Canceled")`;

      if (selectedProject) {
        jql += ` AND project = "${selectedProject}"`;
      }

      jql += ` ORDER BY created ASC`;

      const body = {
        jql,
        maxResults: pageSize,
        fields: ["summary", "status", "assignee", "created"],
      };

      if (token) {
        body.nextPageToken = token;
      }

      const response = await requestJira(`/rest/api/3/search/jql`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      setTickets((prev) => [...prev, ...(data.issues || [])]);

      setNextPageToken(data.nextPageToken || null);

      setTotalTickets(data.total || 0);
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  // SLA Status
  const fetchSLAData = async () => {
    setSlaData([]);

    try {
      let jql = `created >= "${fromDate}" AND created <= "${toDate} 23:59" AND status NOT IN ("Canceled")`;

      if (selectedProject) {
        jql += ` AND project = "${selectedProject}"`;
      }

      let allTickets = [];
      let nextPageToken = null;

      do {
        const body = {
          jql,
          maxResults: 100,
          fields: ["customfield_10273", "customfield_10646", "status"], // ✅ add status
        };

        if (nextPageToken) {
          body.nextPageToken = nextPageToken;
        }

        const response = await requestJira(`/rest/api/3/search/jql`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!data.issues) break;

        allTickets = [...allTickets, ...data.issues];
        nextPageToken = data.nextPageToken;
      } while (nextPageToken);

      if (allTickets.length === 0) {
        setHasSLAConfigured(false);
        setSlaData([]);
        return;
      }

      const resolutionGrouped = { Met: 0, Breached: 0 };
      const responseGrouped = { Met: 0, Breached: 0 };

      // ✅ LOOP ONLY FOR CALCULATION
      let slaFieldExists = false;
      allTickets.forEach((issue) => {
        const resolutionField = issue.fields?.["customfield_10273"];
        const responseField = issue.fields?.["customfield_10646"];

        if (resolutionField !== undefined || responseField !== undefined) {
          slaFieldExists = true;
        }
        const statusCategory =
          issue.fields.status?.statusCategory?.name;

        // 🔹 Resolution SLA (Done only)
        if (statusCategory === "Done" && resolutionField?.value) {
          const sla = resolutionField.value;

          if (sla === "Breached") resolutionGrouped.Breached += 1;
          else if (sla === "Met") resolutionGrouped.Met += 1;
        }

        // 🔹 Response SLA (ALL tickets)
        if (responseField?.value) {
          const sla = responseField.value;

          if (sla === "Breached") responseGrouped.Breached += 1;
          else if (sla === "Met") responseGrouped.Met += 1;
        }
      });

      setHasSLAConfigured(slaFieldExists);

      // ✅ SET STATE HERE (AFTER LOOP)
      setSlaData([
        { label: "Resolution SLA - Met", count: resolutionGrouped.Met },
        { label: "Resolution SLA - Breached", count: resolutionGrouped.Breached },
        { label: "Response SLA - Met", count: responseGrouped.Met },
        { label: "Response SLA - Breached", count: responseGrouped.Breached },
      ]);
    } catch (error) {
      console.error("Error fetching SLA data:", error);
    }
  };
  
  // need to delete this function
  // const total = statusData.reduce((sum, item) => sum + item.count, 0);
  // //const total = totalStatusTickets;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  // // JQL for total donut click
  // let totalJql = `created >= "${fromDate}" AND created <= "${toDate} 23:59"`;

  // if (selectedProject) {
  //   totalJql += ` AND project = "${selectedProject}"`;
  // }

  // const encodedTotalJql = encodeURIComponent(totalJql);
  // const totalJiraUrl = `/issues/?jql=${encodedTotalJql}`;

  const chartStyle = {
    maxWidth: "600px",
    marginTop: "24px",
  };

  const barContainerStyle = {
    display: "flex",
    alignItems: "flex-end",
    gap: "24px",
    height: "200px",
    padding: "16px 16px 40px 16px", // Top, right, bottom (extra for labels), left
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "#f5f5f5",
    boxSizing: "border-box",
  };

  const barStyle = (value) => {
    const availableHeight = 200 - 32; // Container height minus padding
    const barHeight = (value / maxCount) * availableHeight;
    return {
      width: "60px", // Fixed width for bars
      height: `${barHeight}px`,
      backgroundColor: "#0052CC",
      borderRadius: "4px 4px 0 0",
      minHeight: "20px",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      paddingBottom: "8px",
      color: "white",
      fontWeight: "bold",
    };
  };

  const buttonStyle = (isSelected) => ({
    padding: "8px 16px",
    marginRight: "8px",
    backgroundColor: isSelected ? "#0052CC" : "transparent",
    color: isSelected ? "white" : "inherit",
    border: "1px solid #0052CC",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "15px",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const container = {
    padding: "0",
    maxWidth: "100%",
    margin: "10px",
    background: "transparent",
  };


  return (
    <div
      style={{
        padding: "16px 20px",
        minHeight: "100vh",
        boxSizing: "border-box",
        fontSize: "15px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "15px",
        }}
      >
        <button
          className="export-btn"
          onClick={handleExportPDF}
          style={{
            padding: "8px 18px",
            backgroundColor: "#0052CC",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
            fontSize: "16px",
          }}>
          Export PDF
        </button>
      </div>
      {/* FILTER BAR */}
      <FilterSection
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        dropdownRef={dropdownRef}
        showStatusDropdown={showStatusDropdown}
        setShowStatusDropdown={setShowStatusDropdown}
        projectStatusFilter={projectStatusFilter}
        handleProjectStatusChange={handleProjectStatusChange}
        projects={projects}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        error={error}
        onApply={() => {
          if (!selectedProject) {
            setError("No projects available for selected status");
            return;
          }

          setError("");
          setTickets([]);
          setNextPageToken(null);
          setTotalTickets(0);

          fetchTotalTickets();
          fetchIssueData();
          fetchStatusData();
          fetchOpenTickets();
          fetchSLAData();
          fetchOpenStatusSummary();
        }}
         onExportPDF={handleExportPDF}
      />
      {/* CHARTS ROW */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "24px" }}>
        {/* STATUS CREATED */}
        <div id="status-donut">
          <StatusDonut
            statusData={statusData}
            fromDate={fromDate}
            toDate={toDate}
            selectedProject={selectedProject}
          />
        </div>

        {/* ACTIVE */}
        <div id="active-status-donut">
          <ActiveStatusDonut
            openStatusData={openStatusData}
            selectedProject={selectedProject}
          />
        </div>
      </div>

      {/* SLA */}
      <div id="sla-section">
        <SlaSection
          hasSLAConfigured={hasSLAConfigured}
          hasResponseData={hasResponseData}
          hasResolutionData={hasResolutionData}
          slaData={slaData}
          fromDate={fromDate}
          toDate={toDate}
          selectedProject={selectedProject}
        />
      </div>

      {/* BAR CHART */}
      <TicketBarChart
        chartData={chartData}
        maxCount={maxCount}
        selectedProject={selectedProject}
      />
      {/* TABLE */}
      <TicketTable
        issues={issues}
        nextPageToken={nextPageToken}
        fetchOpenTickets={fetchOpenTickets}
      />
    </div>
  );
};

export default App;
