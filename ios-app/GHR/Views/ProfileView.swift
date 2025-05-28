import SwiftUI

struct ProfileView: View {
    @State private var isEditMode = false
    
    // Sample user data - will be replaced with real data
    @State private var userData = UserData(
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 234 567 8900",
        dateOfBirth: Date(timeIntervalSince1970: 599616000), // Example date
        bloodType: "O+",
        emergencyContact: "Jane Doe (+1 234 567 8901)"
    )
    
    var body: some View {
        NavigationView {
            List {
                // Profile Header
                Section {
                    HStack {
                        Image(systemName: "person.circle.fill")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 80, height: 80)
                            .foregroundColor(.blue)
                        
                        VStack(alignment: .leading) {
                            Text(userData.name)
                                .font(.title2)
                                .bold()
                            Text(userData.email)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.vertical, 10)
                }
                
                // Personal Information
                Section("Personal Information") {
                    InfoRow(title: "Phone", value: userData.phone)
                    InfoRow(title: "Date of Birth", value: userData.dateOfBirth.formatted(date: .long, time: .omitted))
                    InfoRow(title: "Blood Type", value: userData.bloodType)
                }
                
                // Emergency Contact
                Section("Emergency Contact") {
                    InfoRow(title: "Contact", value: userData.emergencyContact)
                }
                
                // Settings
                Section("Settings") {
                    NavigationLink("Notifications") {
                        Text("Notifications Settings")
                    }
                    
                    NavigationLink("Privacy") {
                        Text("Privacy Settings")
                    }
                    
                    NavigationLink("Language") {
                        Text("Language Settings")
                    }
                }
                
                // Account Actions
                Section {
                    Button(action: {
                        // TODO: Implement edit profile
                        isEditMode.toggle()
                    }) {
                        Text("Edit Profile")
                            .foregroundColor(.blue)
                    }
                    
                    Button(action: {
                        // TODO: Implement logout
                    }) {
                        Text("Log Out")
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Profile")
            .sheet(isPresented: $isEditMode) {
                EditProfileView(userData: $userData)
            }
        }
    }
}

struct UserData {
    var name: String
    var email: String
    var phone: String
    var dateOfBirth: Date
    var bloodType: String
    var emergencyContact: String
}

struct InfoRow: View {
    let title: String
    let value: String
    
    var body: some View {
        VStack(alignment: .leading) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            Text(value)
                .font(.body)
        }
        .padding(.vertical, 2)
    }
}

struct EditProfileView: View {
    @Binding var userData: UserData
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            Form {
                Section("Personal Information") {
                    TextField("Name", text: $userData.name)
                    TextField("Phone", text: $userData.phone)
                    DatePicker("Date of Birth", selection: $userData.dateOfBirth, displayedComponents: .date)
                    TextField("Blood Type", text: $userData.bloodType)
                }
                
                Section("Emergency Contact") {
                    TextField("Emergency Contact", text: $userData.emergencyContact)
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarItems(
                leading: Button("Cancel") {
                    dismiss()
                },
                trailing: Button("Save") {
                    // TODO: Implement save
                    dismiss()
                }
            )
        }
    }
}

#Preview {
    ProfileView()
} 