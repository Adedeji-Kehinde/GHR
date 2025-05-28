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
import './admin.css';

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

  // Add loading screen render
  if (isLoading) {
    return (
      <>
        <AdminHeader
          title="Admin Dashboard"
          adminName={adminName}
          profilePicture={profilePicture}
        />
        <div className="admin-dashboard-loading-overlay">
          <div className="admin-dashboard-loading-card">
            <div className="admin-dashboard-loading-icon" />
            <div className="admin-dashboard-loading-content">
              <h3 className="admin-dashboard-loading-title">Loading Dashboard</h3>
              <div className="admin-dashboard-progress-container">
                <div 
                  className="admin-dashboard-progress-bar"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <div className="admin-dashboard-loading-text">
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
      <div className="admin-dashboard-main">
        <div className="admin-dashboard-sidebar"><AdminTabs/></div>
        <div className="admin-dashboard-content">

          {/* TOP: KPI cards & Chart */}
          <div className="admin-dashboard-top-section">
            <div className="admin-dashboard-kpi-grid">
              {kpis.map((k,i)=>(
                <div key={i} className="admin-dashboard-card">
                  <h4 className="admin-dashboard-card-title">{k.title}</h4>
                  <p className="admin-dashboard-card-value">{k.value}</p>
                </div>
              ))}
            </div>
            <div className="admin-dashboard-chart-wrapper">
              <div
                className="admin-dashboard-chart-container"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                <h4 className="admin-dashboard-chart-title">
                  {chartSlide===0 ? "Monthly Revenue" : "Occupancy"}
                </h4>
                <div className="admin-dashboard-chart-area">
                  <div className="admin-dashboard-bar-panel" style={{ display: chartSlide===0 ? "block" : "none" }}>
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
                  <div className="admin-dashboard-pie-legend" style={{ display: chartSlide===1 ? "flex" : "none" }}>
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
                  <div className="admin-dashboard-pie-panel" style={{ display: chartSlide===1 ? "flex" : "none" }}>
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
                <div className="admin-dashboard-chart-dots">
                  {[0,1].map(idx=>(
                    <div
                      key={idx}
                      className={`admin-dashboard-dot ${idx===chartSlide ? 'active' : 'inactive'}`}
                      onClick={()=>setChartSlide(idx)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM: Recent Bookings & Payments */}
          <div className="admin-dashboard-two-cols">
            <div className="admin-dashboard-table-card">
              <h4 className="admin-dashboard-table-title">Recent Bookings</h4>
              <table className="admin-dashboard-table">
                <thead>
                  <tr>
                    <th className="admin-dashboard-th">User</th>
                    <th className="admin-dashboard-th">Room</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(rb=>(
                    <tr key={rb.id}>
                      <td className="admin-dashboard-td">{rb.user}</td>
                      <td className="admin-dashboard-td">{rb.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="admin-dashboard-table-card">
              <h4 className="admin-dashboard-table-title">Recent Payments</h4>
              <table className="admin-dashboard-table">
                <thead>
                  <tr>
                    <th className="admin-dashboard-th">User</th>
                    <th className="admin-dashboard-th">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map(rp=>(
                    <tr key={rp.id}>
                      <td className="admin-dashboard-td">{rp.user}</td>
                      <td className="admin-dashboard-td">{rp.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* UPCOMING CHECK‑INS / CHECK‑OUTS */}
          <div className="admin-dashboard-section">
            <h4 className="admin-dashboard-section-title">Upcoming Check‑Ins / Check‑Outs</h4>
            <div className="admin-dashboard-two-cols">
              <div className="admin-dashboard-table-card">
                <h5 className="admin-dashboard-section-title">Check‑Ins</h5>
                <table className="admin-dashboard-up-table">
                  <thead>
                    <tr>
                      <th className="admin-dashboard-up-th">User</th>
                      <th className="admin-dashboard-up-th">Room</th>
                      <th className="admin-dashboard-up-th">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingIns.map(ci=>(
                      <tr key={ci.id}>
                        <td className="admin-dashboard-up-td">{ci.user}</td>
                        <td className="admin-dashboard-up-td">{ci.room}</td>
                        <td className="admin-dashboard-up-td">{ci.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-dashboard-table-card">
                <h5 className="admin-dashboard-section-title">Check‑Outs</h5>
                <table className="admin-dashboard-up-table">
                  <thead>
                    <tr>
                      <th className="admin-dashboard-up-th">User</th>
                      <th className="admin-dashboard-up-th">Room</th>
                      <th className="admin-dashboard-up-th">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingOuts.map(co=>(
                      <tr key={co.id}>
                        <td className="admin-dashboard-up-td">{co.user}</td>
                        <td className="admin-dashboard-up-td">{co.room}</td>
                        <td className="admin-dashboard-up-td">{co.date}</td>
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
