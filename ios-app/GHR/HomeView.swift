import SwiftUI

struct HomeView: View {
    @State private var showMenu = false
    
    var body: some View {
        NavigationView {
            ZStack {
                Color(UIColor.systemGroupedBackground)
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 25) {
                        // Welcome Header
                        HStack {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Welcome to GHR")
                                    .font(.title)
                                    .bold()
                                Text("Your Health Services Hub")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            Spacer()
                        }
                        .padding(.horizontal)
                        
                        // Main Services Grid
                        LazyVGrid(columns: [GridItem(.flexible())], spacing: 20) {
                            // Delivery Services
                            NavigationLink(destination: DeliveryServicesView()) {
                                ServiceCard(
                                    title: "Delivery Services",
                                    subtitle: "Medicine and equipment delivery",
                                    icon: "box.truck.fill",
                                    color: .blue
                                )
                            }
                            
                            // Enquiry Services
                            NavigationLink(destination: EnquiryServicesView()) {
                                ServiceCard(
                                    title: "Enquiry Services",
                                    subtitle: "Ask questions and get support",
                                    icon: "questionmark.circle.fill",
                                    color: .purple
                                )
                            }
                            
                            // Maintenance
                            NavigationLink(destination: MaintenanceServicesView()) {
                                ServiceCard(
                                    title: "Maintenance",
                                    subtitle: "Equipment maintenance and repair",
                                    icon: "wrench.and.screwdriver.fill",
                                    color: .orange
                                )
                            }
                            
                            // Emergency Services
                            NavigationLink(destination: EmergencyServicesView()) {
                                ServiceCard(
                                    title: "Emergency Services",
                                    subtitle: "24/7 emergency support",
                                    icon: "cross.circle.fill",
                                    color: .red
                                )
                            }
                            
                            // Health Records
                            NavigationLink(destination: HealthRecordsView()) {
                                ServiceCard(
                                    title: "Health Records",
                                    subtitle: "View and manage your records",
                                    icon: "folder.fill.badge.person.crop",
                                    color: .green
                                )
                            }
                            
                            // Appointments
                            NavigationLink(destination: AppointmentsView()) {
                                ServiceCard(
                                    title: "Appointments",
                                    subtitle: "Schedule and manage appointments",
                                    icon: "calendar.badge.clock",
                                    color: .indigo
                                )
                            }
                        }
                        .padding(.horizontal)
                    }
                    .padding(.vertical)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { showMenu.toggle() }) {
                        Image(systemName: "line.3.horizontal")
                            .foregroundColor(.primary)
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {}) {
                        Image(systemName: "bell.fill")
                            .foregroundColor(.primary)
                    }
                }
            }
            .sheet(isPresented: $showMenu) {
                MenuView()
            }
        }
    }
}

struct ServiceCard: View {
    let title: String
    let subtitle: String
    let icon: String
    let color: Color
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .font(.system(size: 30))
                .foregroundColor(color)
                .frame(width: 60)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(UIColor.systemBackground))
        .cornerRadius(15)
        .shadow(radius: 2)
    }
}

struct MenuView: View {
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            List {
                Section("Services") {
                    MenuLink(title: "Delivery Services", icon: "box.truck.fill")
                    MenuLink(title: "Enquiry Services", icon: "questionmark.circle.fill")
                    MenuLink(title: "Maintenance", icon: "wrench.and.screwdriver.fill")
                    MenuLink(title: "Emergency Services", icon: "cross.circle.fill")
                    MenuLink(title: "Health Records", icon: "folder.fill.badge.person.crop")
                    MenuLink(title: "Appointments", icon: "calendar.badge.clock")
                }
                
                Section("Settings") {
                    MenuLink(title: "Notifications", icon: "bell.fill")
                    MenuLink(title: "Privacy", icon: "lock.fill")
                    MenuLink(title: "Help & Support", icon: "questionmark.circle.fill")
                }
            }
            .navigationTitle("Menu")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct MenuLink: View {
    let title: String
    let icon: String
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(.blue)
                .frame(width: 30)
            Text(title)
        }
    }
}

// Placeholder Views for Navigation
struct DeliveryServicesView: View {
    var body: some View {
        Text("Delivery Services")
            .navigationTitle("Delivery Services")
    }
}

struct EnquiryServicesView: View {
    var body: some View {
        Text("Enquiry Services")
            .navigationTitle("Enquiry Services")
    }
}

struct MaintenanceServicesView: View {
    var body: some View {
        Text("Maintenance Services")
            .navigationTitle("Maintenance")
    }
}

struct EmergencyServicesView: View {
    var body: some View {
        Text("Emergency Services")
            .navigationTitle("Emergency")
    }
}

struct HealthRecordsView: View {
    var body: some View {
        Text("Health Records")
            .navigationTitle("Health Records")
    }
}

struct AppointmentsView: View {
    var body: some View {
        Text("Appointments")
            .navigationTitle("Appointments")
    }
}

#Preview {
    HomeView()
} 