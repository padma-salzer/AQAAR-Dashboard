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
import calendarIcon from "./assets/calendar-regular.png";
import projectIcon from "./assets/headset-solid.png";
import aqaarLogo from "./assets/Aqaar-logo.png";
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
  const [projectStatusFilter, setProjectStatusFilter] = useState(["Others"]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [isProjectLoading, setIsProjectLoading] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);
  const [hasSLAConfigured, setHasSLAConfigured] = useState(true);
  //const [totalStatusTickets, setTotalStatusTickets] = useState(0);

  // const hasResolutionData =
  //   (slaData[0]?.count || 0) + (slaData[1]?.count || 0) > 0;

  // const hasResponseData =
  //   (slaData[2]?.count || 0) + (slaData[3]?.count || 0) > 0;

  const hasPriorityResolutionData =
    (slaData[0]?.count || 0) + (slaData[1]?.count || 0) > 0;

  const hasPriorityResponseData =
    (slaData[2]?.count || 0) + (slaData[3]?.count || 0) > 0;

  const hasSeverityResolutionData =
    (slaData[4]?.count || 0) + (slaData[5]?.count || 0) > 0;

  const hasSeverityResponseData =
    (slaData[6]?.count || 0) + (slaData[7]?.count || 0) > 0;

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

    doc.setDrawColor(0, 153, 76);
    doc.setLineWidth(1);

    doc.roundedRect(
      PAGE_MARGIN,
      PAGE_MARGIN,
      pageWidth - PAGE_MARGIN * 2,
      pageHeight - PAGE_MARGIN * 2,
      4, // x-radius
      4, // y-radius
      "S",
    );
  };

  // helper function to add header to pdf
  const addHeader = (doc) => {
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.addImage(aqaarLogo, "PNG", 12, 14, 24, 12);

    // Report Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(25, 55, 109);
    doc.text("AQAAR Report", pageWidth / 2, 22, { align: "center" });

    // Company Logo
    doc.addImage(salzerLogo, "PNG", pageWidth - 45, 14, 24, 8);

    // Header Line
    // doc.setDrawColor(180);
    // doc.setLineWidth(0.3);
    // doc.line(
    //   LEFT_MARGIN - 5,
    //   25,
    //   pageWidth - RIGHT_MARGIN,
    //   25
    // );
  };

  // add footer helper function
  const addFooter = (doc, pageNumber, totalPages) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);

    const pageText = `Page ${pageNumber} of ${totalPages}`;

    doc.text(pageText, pageWidth - RIGHT_MARGIN, pageHeight - PAGE_MARGIN - 6, {
      align: "right",
    });
  };

  const formatDate = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  const formattedFrom = formatDate(fromDate);
  const formattedTo = formatDate(toDate);

  // Export pdf button
  const handleExportPDF = async () => {
    const selectedProjectObj = projects.find(
      (project) => project.key === selectedProject,
    );

    const projectName = selectedProjectObj
      ? selectedProjectObj.name
      : selectedProject;

    //Donut Charts
    const donutElement = document.getElementById("status-donut");
    const canvas = await html2canvas(donutElement, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const image = canvas.toDataURL("image/png");

    // Active Status Donut
    const activeElement = document.getElementById("active-status-donut");
    const activeCanvas = await html2canvas(activeElement, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const activeImage = activeCanvas.toDataURL("image/png");
    // SLA Section
    const slaElement = document.getElementById("sla-section");
    const slaCanvas = await html2canvas(slaElement, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const slaImage = slaCanvas.toDataURL("image/png");
    const imgWidth = 100;

    //PDF
    const allTickets = await fetchAllTickets();
    const tableRows = allTickets.map((issue) => [
      issue.key,
      issue.fields.summary,
      issue.fields.status.name,
      issue.fields.customfield_10778?.value || "-",
      new Date(issue.fields.created).toLocaleDateString(),
      issue.fields.resolutiondate
        ? new Date(issue.fields.resolutiondate).toLocaleDateString()
        : "-",
    ]);

    const doc = new jsPDF();
    addHeader(doc);
    addPageBorder(doc);
    let y = 30;

    // STEP 1 - Draw the information box
    const pageWidth = doc.internal.pageSize.getWidth();
    const boxX = LEFT_MARGIN;
    const boxY = y;
    const boxWidth = pageWidth - LEFT_MARGIN - RIGHT_MARGIN;
    const boxHeight = 42;

    doc.setDrawColor(210, 220, 235);
    doc.setFillColor(250, 252, 255);
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, "FD");

    // Project Icon
    doc.addImage(projectIcon, "PNG", boxX + 6, boxY + 9, 8, 8);

    // PROJECT label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(41, 98, 255);
    doc.text("PROJECT :", boxX + 17, boxY + 13);

    // Project Name
    const labelWidth = doc.getTextWidth("PROJECT :") + 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(25, 55, 109);
    doc.text(projectName, boxX + 17 + labelWidth, boxY + 13);

    // Divider
    doc.setDrawColor(225);
    doc.line(boxX, boxY + 20, boxX + boxWidth, boxY + 20);

    //from date
    doc.addImage(calendarIcon, "PNG", boxX + 8, boxY + 24, 6, 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(41, 98, 255);
    doc.text("FROM DATE", boxX + 17, boxY + 28);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(25, 55, 109);
    doc.text(formattedFrom, boxX + 17, boxY + 35);

    //To date
    doc.addImage(calendarIcon, "PNG", boxX + 105, boxY + 24, 6, 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(41, 98, 255);
    doc.text("TO DATE", boxX + 114, boxY + 28);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(25, 55, 109);
    doc.text(formattedTo, boxX + 114, boxY + 35);
    // Move Y below the information box
    y = boxY + boxHeight + 10;

    // doc.setFont("helvetica", "normal");
    // doc.setFontSize(12);
    // doc.text(`Project: ${projectName}`, LEFT_MARGIN, y);
    // y += 10;
    // doc.text(`From Date: ${fromDate}`, LEFT_MARGIN, y);
    // doc.text(`To Date: ${toDate}`, 110, y);
    // y += 10;

    //Donut Charts
    const statusHeight = (canvas.height * imgWidth) / canvas.width;
    doc.addImage(image, "PNG", 20, y, imgWidth, statusHeight);
    y += statusHeight + 10;

    // Active Status Donut
    const activeHeight = (activeCanvas.height * imgWidth) / activeCanvas.width;
    doc.addImage(activeImage, "PNG", 20, y, imgWidth, activeHeight);
    y += activeHeight + 10;
    // SLA Section
    // doc.addPage();
    // addHeader(doc);
    // addPageBorder(doc);

    const slaHeight = (slaCanvas.height * imgWidth) / slaCanvas.width;
    doc.addImage(slaImage, "PNG", 20, y, 170, slaHeight + 15);
    y += activeHeight + 20;
    doc.addPage();
    addHeader(doc);
    addPageBorder(doc);
    let tableStartY = 30;
    doc.setTextColor(25, 55, 109);
    doc.setFontSize(10);
    doc.text("All Ticket Details", 15, tableStartY + 3);
    autoTable(doc, {
      startY: tableStartY + 6,
      head: [
        ["Key", "Summary", "Status", "Issue Type", "Created", "Resolution"],
      ],
      body: tableRows,
      didDrawPage: () => {
        addHeader(doc);
        addPageBorder(doc);
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
    let jql = "";
    if (selectedProject) {
      jql += `project = "${selectedProject}"`;
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
          "created",
          "resolutiondate",
          "customfield_10778",
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

    console.log(filtered);

    // ADD THIS FILTER
    const jiraOnly = filtered.filter(
      //(project) => project.projectTypeKey === "software"
      (project) => project.projectTypeKey === "service_desk",
    );

    //SORT
    const sorted = [...jiraOnly].sort((a, b) => a.name.localeCompare(b.name));

    setProjects(sorted);

    const isValidSelection = sorted.some((p) => p.key === selectedProject);

    if (!isValidSelection) {
      const defaultProject = sorted.find((project) => project.key === "AASD");

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
      //let jql = `statusCategory != Done AND status NOT IN ("Closed","Resolved","Canceled")`;
      let jql = "";
      if (selectedProject) {
        jql += `project = "${selectedProject}"`;
      }

      jql += ` ORDER BY created ASC`;

      const body = {
        jql,
        maxResults: pageSize,
        fields: [
          "summary",
          "status",
          "issuecategory",
          "created",
          "resolutiondate",
          "customfield_10778",
        ],
        //fields: ["*all"]
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
  const SLA_FIELDS = {
    priorityResponse: "customfield_10884",
    priorityResolution: "customfield_10885",
    severityResponse: "customfield_10882",
    severityResolution: "customfield_10883",
  };

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
          fields: [
            SLA_FIELDS.priorityResponse,
            SLA_FIELDS.priorityResolution,
            SLA_FIELDS.severityResponse,
            SLA_FIELDS.severityResolution,
            "status",
          ], // ✅ add status
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

      const priorityResolutionGrouped = { Met: 0, Breached: 0 };
      const priorityResponseGrouped = { Met: 0, Breached: 0 };

      const severityResolutionGrouped = { Met: 0, Breached: 0 };
      const severityResponseGrouped = { Met: 0, Breached: 0 };

      // ✅ LOOP ONLY FOR CALCULATION
      let slaFieldExists = false;
      allTickets.forEach((issue) => {
        const priorityResolutionField =
          issue.fields?.[SLA_FIELDS.priorityResolution];

        const priorityResponseField =
          issue.fields?.[SLA_FIELDS.priorityResponse];

        const severityResolutionField =
          issue.fields?.[SLA_FIELDS.severityResolution];

        const severityResponseField =
          issue.fields?.[SLA_FIELDS.severityResponse];

        if (
          priorityResolutionField !== undefined ||
          priorityResponseField !== undefined ||
          severityResolutionField !== undefined ||
          severityResponseField !== undefined
        ) {
          slaFieldExists = true;
        }
        const statusCategory = issue.fields.status?.statusCategory?.name;

        // 🔹 Resolution SLA (Done only)
        if (statusCategory === "Done" && priorityResolutionField?.value) {
          const sla = priorityResolutionField.value;

          if (sla === "Breached") priorityResolutionGrouped.Breached += 1;
          else if (sla === "Met") priorityResolutionGrouped.Met += 1;
        }

        // Severity SLA For Done
        if (statusCategory === "Done" && severityResolutionField?.value) {
          if (severityResolutionField.value === "Met") {
            severityResolutionGrouped.Met++;
          } else if (severityResolutionField.value === "Breached") {
            severityResolutionGrouped.Breached++;
          }
        }

        // 🔹 Response SLA (ALL tickets)
        if (priorityResponseField?.value) {
          const sla = priorityResponseField.value;

          if (sla === "Breached") priorityResponseGrouped.Breached += 1;
          else if (sla === "Met") priorityResponseGrouped.Met += 1;
        }

        // Severity Response SLA (All tickets)
        if (severityResponseField?.value) {
          if (severityResponseField.value === "Met") {
            severityResponseGrouped.Met++;
          } else if (severityResponseField.value === "Breached") {
            severityResponseGrouped.Breached++;
          }
        }
      });

      setHasSLAConfigured(slaFieldExists);

      // ✅ SET STATE HERE (AFTER LOOP)
      setSlaData([
        {
          label: "Priority Resolution SLA - Met",
          count: priorityResolutionGrouped.Met,
        },
        {
          label: "Priority Resolution SLA - Breached",
          count: priorityResolutionGrouped.Breached,
        },
        {
          label: "Priority Response SLA - Met",
          count: priorityResponseGrouped.Met,
        },
        {
          label: "Priority Response SLA - Breached",
          count: priorityResponseGrouped.Breached,
        },

        // Severity
        {
          label: "Severity Resolution SLA - Met",
          count: severityResolutionGrouped.Met,
        },
        {
          label: "Severity Resolution SLA - Breached",
          count: severityResolutionGrouped.Breached,
        },
        {
          label: "Severity Response SLA - Met",
          count: severityResponseGrouped.Met,
        },
        {
          label: "Severity Response SLA - Breached",
          count: severityResponseGrouped.Breached,
        },
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
          }}
        >
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
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "24px",
          alignItems: "stretch",
        }}
      >
        {/* STATUS CREATED */}
        <div
          id="status-donut"
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
          }}
        >
          <StatusDonut
            statusData={statusData}
            fromDate={fromDate}
            toDate={toDate}
            selectedProject={selectedProject}
          />
        </div>

        {/* ACTIVE */}
        <div
          id="active-status-donut"
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
          }}
        >
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
          hasPriorityResolutionData={hasPriorityResolutionData}
          hasPriorityResponseData={hasPriorityResponseData}
          hasSeverityResolutionData={hasSeverityResolutionData}
          hasSeverityResponseData={hasSeverityResponseData}
          // hasResponseData={hasResponseData}
          // hasResolutionData={hasResolutionData}
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
