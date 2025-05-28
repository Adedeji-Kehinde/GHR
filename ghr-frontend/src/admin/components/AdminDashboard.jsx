import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const API_URL =  "http://localhost:8000";
const HEADER_HEIGHT = 60; // your header height

export default function AdminDashboard() {
  // Add loading state
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // ─── State ─────────────────────────────────────────────────────────────
  const [adminName, setAdminName] = useState("Admin");
  const [profilePicture, setProfilePicture] = useState("/images/default-profile.png");

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [totalEnquiries, setTotalEnquiries] = useState(0);

  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([
    { name: "Occupied", value: 0 },
    { name: "Free",     value: 0 }
  ]);

  const [recentBookings, setRecentBookings] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  const [upcomingIns, setUpcomingIns] = useState([]);
  const [upcomingOuts, setUpcomingOuts] = useState([]);

  // Chart carousel
  const [chartSlide, setChartSlide] = useState(0);
  const chartTouch = useRef(null);

  // KPI cards (extend by adding to this array)
  const kpis = [
    { title: "Total Revenue (€)", value: totalRevenue.toFixed(2) },
    { title: "Pending Payments",   value: pendingPaymentsCount },
    { title: "Total Deliveries",   value: totalDeliveries },
    { title: "Total Enquiries",    value: totalEnquiries },
  ];

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setLoadingProgress(0);
      
      try {
        // Fetch admin info
        await fetchAdminInfo();
        setLoadingProgress(25);
        
        // Fetch dashboard data
        await fetchDashboardData();
        setLoadingProgress(75);
        
        // Fetch occupancy data
        await fetchOccupancyData();
        setLoadingProgress(100);
        
        // Small delay to show 100% completion
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /** Fetch admin profile */
  async function fetchAdminInfo() {
    try {
      const { data } = await axios.get(`${API_URL}/api/auth/user`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setAdminName(data.name);
      setProfilePicture(data.profileImageUrl || "/images/default-profile.png");
    } catch (e) {
      console.error(e);
    }
  }

  /** Fetch bookings, payments, deliveries, enquiries */
  async function fetchDashboardData() {
    try {
      const token = localStorage.getItem("token");

      // All bookings
      const { data: allBookings } = await axios.get(
        `${API_URL}/api/booking/bookings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const bookedOnly = allBookings.filter(b => b.status === "Booked");

      // Recent Bookings: last 3
      setRecentBookings(
        bookedOnly
          .sort((a, b) => (a._id < b._id ? 1 : -1))
          .slice(0, 3)
          .map(b => {
            const apt = String(b.apartmentNumber).padStart(2, "0");
            const roomNum = `${b.buildingBlock}${b.floor}${apt}${b.bedSpace}${b.bedNumber||""}`;
            return {
              id: b._id,
              user: `${b.userId.name} ${b.userId.lastName}`,
              room: roomNum
            };
          })
      );

      // Payments per booking
      let allPayments = [];
      for (let b of allBookings) {
        const res = await axios.get(
          `${API_URL}/api/booking/bookings/${b._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { booking, payments } = res.data;
        const user = `${booking.userId.name} ${booking.userId.lastName}`;
        payments.forEach(p => allPayments.push({ ...p, user }));
      }
      const paid   = allPayments.filter(p => p.status === "Paid");
      const unpaid = allPayments.filter(p => p.status === "Unpaid");

      setTotalRevenue(paid.reduce((s, p) => s + p.amount, 0));
      setPendingPaymentsCount(unpaid.length);

      // Recent Payments: last 3
      setRecentPayments(
        paid
          .sort((a, b) => (a._id < b._id ? 1 : -1))
          .slice(0, 3)
          .map(p => ({
            id: p._id + p.dueDate,
            user: p.user,
            amount: `€${p.amount.toFixed(2)}`
          }))
      );

      // Deliveries & Enquiries totals
      const [delRes, enqRes] = await Promise.all([
        axios.get(`${API_URL}/api/auth/deliveries`, { headers:{ Authorization:`Bearer ${token}` }}),
        axios.get(`${API_URL}/api/auth/enquiries`,  { headers:{ Authorization:`Bearer ${token}` }})
      ]);
      setTotalDeliveries(delRes.data.length);
      setTotalEnquiries(enqRes.data.length);

      // Monthly revenue chart
      const revByMonth = {};
      paid.forEach(p => {
        const m = new Date(p.dueDate)
          .toLocaleString("default", { month:"short", year:"numeric" });
        revByMonth[m] = (revByMonth[m]||0) + p.amount;
      });
      setMonthlyRevenueData(
        Object.entries(revByMonth)
          .sort((a,b)=> new Date(`1 ${a[0]}`) - new Date(`1 ${b[0]}`))
          .map(([month, revenue]) => ({ month, revenue }))
      );

      // Upcoming Check‑Ins & Check‑Outs
      const now = new Date();
      setUpcomingIns(
        bookedOnly
          .filter(b => new Date(b.checkInDate) >= now)
          .sort((a,b)=> new Date(a.checkInDate) - new Date(b.checkInDate))
          .slice(0,3)
          .map(b => ({
            id: b._id,
            user: `${b.userId.name} ${b.userId.lastName}`,
            room: b.userId.roomNumber,
            date: new Date(b.checkInDate).toLocaleDateString("en-US")
          }))
      );
      setUpcomingOuts(
        bookedOnly
          .filter(b => new Date(b.checkOutDate) >= now)
          .sort((a,b)=> new Date(a.checkOutDate) - new Date(b.checkOutDate))
          .slice(0,3)
          .map(b => ({
            id: b._id,
            user: `${b.userId.name} ${b.userId.lastName}`,
            room: b.userId.roomNumber,
            date: new Date(b.checkOutDate).toLocaleDateString("en-US")
          }))
      );

    } catch (e) {
      console.error(e);
    }
  }

  /** Count beds across rooms */
  async function fetchOccupancyData() {
    try {
      const token = localStorage.getItem("token");
      const { data: rooms } = await axios.get(
        `${API_URL}/api/booking/rooms`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let totalBeds=0, freeBeds=0;
      rooms.forEach(r => {
        Object.values(r.bedSpaces).forEach(bs => {
          if(bs.roomType==="Ensuite"){
            totalBeds++;
            if(!bs.bed1) freeBeds++;
          } else {
            totalBeds+=2;
            if(!bs.bed1) freeBeds++;
            if(!bs.bed2) freeBeds++;
          }
        });
      });
      setOccupancyData([
        { name:"Occupied", value: totalBeds-freeBeds },
        { name:"Free",     value: freeBeds }
      ]);
    } catch(e){
      console.error(e);
    }
  }

  // ─── Chart Swipe ────────────────────────────────────────────────────────
  const onTouchStart = e => { chartTouch.current = e.touches[0].clientX; };
  const onTouchEnd   = e => {
    if(chartTouch.current===null) return;
    const diff = e.changedTouches[0].clientX - chartTouch.current;
    if(Math.abs(diff)>50){
      setChartSlide(si=>(si + (diff<0?1:-1) + 2)%2);
    }
    chartTouch.current=null;
  };

  // ─── Styles ────────────────────────────────────────────────────────────
  const styles = {
    main: {
      display:"flex",
      marginTop:HEADER_HEIGHT,
      width:"100vw",
      height:`calc(100vh - ${HEADER_HEIGHT}px)`,
      overflowX:"hidden"
    },
    sidebar:{ width:"60px", flexShrink:0, position:"relative", zIndex:10 },
    content:{
      flex:1,
      padding:"1rem",
      background:"#f8f9fa",
      overflowY:"auto"
    },

    topSection:{ display:"flex", gap:"1rem", marginBottom:"1rem" },
    kpiGrid:{
      flex:1,
      display:"grid",
      gridTemplateColumns:"repeat(2,1fr)",
      gap:"1rem"
    },
    card:{
      background:"#fff",
      padding:"1rem",
      borderRadius:8,
      boxShadow:"0 2px 8px rgba(0,0,0,0.1)",
      textAlign:"left"
    },
    cardTitle:{ margin:0, fontWeight:"bold" },
    cardValue:{ margin:"0.5rem 0 0", fontWeight:"bold", fontSize:"1.5rem" },

    chartWrapper:{ flex:1,display:"flex",flexDirection:"column" },
    chartContainer:{
      flex:1,
      background:"#fff",
      borderRadius:8,
      boxShadow:"0 2px 8px rgba(0,0,0,0.1)",
      padding:"1rem",
      display:"flex",
      flexDirection:"column",
      height:"600px"
    },
    chartTitle:{ margin:0,textAlign:"left",fontWeight:"bold",marginBottom:"0.5rem" },
    chartArea:{ flex:1,display:"flex" },
    barPanel:{ flex:1,display:chartSlide===0?"block":"none" },
    pieLegend:{
      display:chartSlide===1?"flex":"none",
      flexDirection:"column",
      justifyContent:"center",
      marginRight:"1rem",
      textAlign:"left"
    },
    piePanel:{ flex:1,display:chartSlide===1?"flex":"none" },
    chartDots:{ display:"flex",justifyContent:"center",gap:6,marginTop:"0.5rem" },
    dot: active=>({
      width:8,height:8,borderRadius:"50%",
      background:active?"#333":"#ccc",
      cursor:"pointer"
    }),

    bottomSection:{ marginTop:"1rem" },
    twoCols:{ display:"flex",gap:"1rem" },
    tableCard:{
      flex:1,
      background:"#fff",
      borderRadius:8,
      boxShadow:"0 2px 8px rgba(0,0,0,0.1)",
      padding:"1rem",
      overflowY:"auto",
      maxHeight:"200px"
    },
    tableTitle:{ margin:0,textAlign:"left",fontWeight:"bold",marginBottom:"0.5rem" },
    table:{ width:"100%",borderCollapse:"collapse" },
    th:{ textAlign:"left",padding:8,borderBottom:"2px solid #ddd" },
    td:{ textAlign:"left",padding:8,borderBottom:"1px solid #eee" },

    // Upcoming
    section:{ marginTop:"1rem" },
    sectionTitle:{ margin:0,textAlign:"left",fontWeight:"bold",marginBottom:"0.5rem" },
    upTable:{ width:"100%", borderCollapse:"collapse" },
    upTh:{ textAlign:"left", padding:8, borderBottom:"2px solid #ddd" },
    upTd:{ textAlign:"left", padding:8, borderBottom:"1px solid #eee" }
  };

  // Add loading screen styles
  const loadingStyles = {
    loadingOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#f8f9fa',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    loadingContent: {
      textAlign: 'center',
      maxWidth: '400px',
      padding: '2rem',
    },
    loadingTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: '1rem',
    },
    progressContainer: {
      width: '100%',
      height: '4px',
      backgroundColor: '#e9ecef',
      borderRadius: '2px',
      overflow: 'hidden',
      marginBottom: '1rem',
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#007bff',
      borderRadius: '2px',
      transition: 'width 0.3s ease-in-out',
    },
    loadingText: {
      color: '#6c757d',
      fontSize: '1rem',
      marginTop: '0.5rem',
    },
    loadingCard: {
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '2rem',
      animation: 'pulse 1.5s infinite',
    },
    '@keyframes pulse': {
      '0%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.02)' },
      '100%': { transform: 'scale(1)' },
    },
    loadingIcon: {
      width: '48px',
      height: '48px',
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #007bff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 1rem auto',
    },
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
  };

  // Add loading screen render
  if (isLoading) {
    return (
      <>
        <AdminHeader
          title="Admin Dashboard"
          adminName={adminName}
          profilePicture={profilePicture}
        />
        <div style={loadingStyles.loadingOverlay}>
          <div style={loadingStyles.loadingCard}>
            <div style={loadingStyles.loadingIcon} />
            <div style={loadingStyles.loadingContent}>
              <h3 style={loadingStyles.loadingTitle}>Loading Dashboard</h3>
              <div style={loadingStyles.progressContainer}>
                <div 
                  style={{
                    ...loadingStyles.progressBar,
                    width: `${loadingProgress}%`
                  }}
                />
              </div>
              <div style={loadingStyles.loadingText}>
                {loadingProgress === 100 ? 
                  'Almost there...' : 
                  'Loading dashboard data...'}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <AdminHeader
        title="Admin Dashboard"
        adminName={adminName}
        profilePicture={profilePicture}
      />
      <div style={styles.main}>
        <div style={styles.sidebar}><AdminTabs/></div>
        <div style={styles.content}>

          {/* TOP: KPI cards & Chart */}
          <div style={styles.topSection}>
            <div style={styles.kpiGrid}>
              {kpis.map((k,i)=>(
                <div key={i} style={styles.card}>
                  <h4 style={styles.cardTitle}>{k.title}</h4>
                  <p style={styles.cardValue}>{k.value}</p>
                </div>
              ))}
            </div>
            <div style={styles.chartWrapper}>
              <div
                style={styles.chartContainer}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                <h4 style={styles.chartTitle}>
                  {chartSlide===0 ? "Monthly Revenue" : "Occupancy"}
                </h4>
                <div style={styles.chartArea}>
                  <div style={styles.barPanel}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month"/>
                        <YAxis/>
                        <Tooltip/>
                        <Bar dataKey="revenue"/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={styles.pieLegend}>
                    <Legend
                      verticalAlign="middle"
                      layout="vertical"
                      iconType="square"
                      payload={occupancyData.map((e,i)=>({
                        id:e.name,
                        value:`${e.name}: ${e.value}`,
                        color:i===0?"#8884d8":"#82ca9d"
                      }))}
                    />
                  </div>
                  <div style={styles.piePanel}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={occupancyData}
                          dataKey="value"
                          nameKey="name"
                          outerRadius="80%"
                          paddingAngle={3}
                          label={({percent})=>`${(percent*100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {occupancyData.map((_,i)=>(
                            <Cell key={i} fill={i===0?"#8884d8":"#82ca9d"}/>
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value,name)=>[
                            value,
                            `${name} (${((value/(occupancyData[0].value+occupancyData[1].value))*100).toFixed(0)}%)`
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div style={styles.chartDots}>
                  {[0,1].map(idx=>(
                    <div
                      key={idx}
                      style={styles.dot(idx===chartSlide)}
                      onClick={()=>setChartSlide(idx)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM: Recent Bookings & Payments */}
          <div style={styles.twoCols}>
            <div style={styles.tableCard}>
              <h4 style={styles.tableTitle}>Recent Bookings</h4>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Room</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(rb=>(
                    <tr key={rb.id}>
                      <td style={styles.td}>{rb.user}</td>
                      <td style={styles.td}>{rb.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={styles.tableCard}>
              <h4 style={styles.tableTitle}>Recent Payments</h4>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map(rp=>(
                    <tr key={rp.id}>
                      <td style={styles.td}>{rp.user}</td>
                      <td style={styles.td}>{rp.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* UPCOMING CHECK‑INS / CHECK‑OUTS */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Upcoming Check‑Ins / Check‑Outs</h4>
            <div style={styles.twoCols}>
              <div style={styles.tableCard}>
                <h5 style={styles.sectionTitle}>Check‑Ins</h5>
                <table style={styles.upTable}>
                  <thead>
                    <tr>
                      <th style={styles.upTh}>User</th>
                      <th style={styles.upTh}>Room</th>
                      <th style={styles.upTh}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingIns.map(ci=>(
                      <tr key={ci.id}>
                        <td style={styles.upTd}>{ci.user}</td>
                        <td style={styles.upTd}>{ci.room}</td>
                        <td style={styles.upTd}>{ci.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={styles.tableCard}>
                <h5 style={styles.sectionTitle}>Check‑Outs</h5>
                <table style={styles.upTable}>
                  <thead>
                    <tr>
                      <th style={styles.upTh}>User</th>
                      <th style={styles.upTh}>Room</th>
                      <th style={styles.upTh}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingOuts.map(co=>(
                      <tr key={co.id}>
                        <td style={styles.upTd}>{co.user}</td>
                        <td style={styles.upTd}>{co.room}</td>
                        <td style={styles.upTd}>{co.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
