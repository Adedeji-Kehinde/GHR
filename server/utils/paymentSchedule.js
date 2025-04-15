// utils/generatePaymentSchedule.js
function generatePaymentSchedule(checkInDateStr, checkOutDateStr, pricePerNight) {
    const checkInDate = new Date(checkInDateStr);
    const checkOutDate = new Date(checkOutDateStr);
    const msInDay = 1000 * 60 * 60 * 24;
    const schedule = [];
    let current = new Date(checkInDate);
    current.setDate(1);
    
    while (current < checkOutDate) {
      const year = current.getFullYear();
      const month = current.getMonth();
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0);
      
      // Actual stay dates in this month
      const stayStart = new Date(Math.max(startOfMonth, checkInDate));
      const stayEnd = new Date(Math.min(endOfMonth, checkOutDate));
      
      const nights = Math.round((stayEnd - stayStart) / msInDay) + 1;
      const amount = nights * pricePerNight;
      
      // Determine due date:
      // For the first partial month, due on the check-in date.
      // For subsequent months, due on the 1st of the previous month.
      const dueDate = schedule.length === 0
        ? new Date(checkInDate)
        : new Date(year, month - 1, 1);
      
      schedule.push({
        stayMonth: stayStart.toLocaleString("default", { month: "long", year: "numeric" }),
        stayDates: `${stayStart.getDate()} – ${stayEnd.getDate()} ${stayEnd.toLocaleString("default", { month: "short" })}`,
        nights,
        amount,
        dueDate, // raw Date; client can format it
        status: "Unpaid"
      });
      
      current.setMonth(current.getMonth() + 1);
    }
    
    return schedule;
  }
  
  module.exports = generatePaymentSchedule;
  