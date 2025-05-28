import SwiftUI

struct Announcement: Identifiable {
    let id: String
    let title: String
    let description: String
    let date: Date
    let author: String
    let imageUrl: String?
}

struct AnnouncementsView: View {
    // Sample data - will be replaced with real data later
    @State private var announcements = [
        Announcement(
            id: "1",
            title: "COVID-19 Vaccination Update",
            description: "New vaccination schedules available for all age groups. Book your appointment now.",
            date: Date(),
            author: "Health Department",
            imageUrl: nil
        ),
        Announcement(
            id: "2",
            title: "Health Awareness Week",
            description: "Join us for a week of health awareness activities and free check-ups.",
            date: Date().addingTimeInterval(-86400),
            author: "Community Health Center",
            imageUrl: nil
        )
    ]
    
    var body: some View {
        NavigationView {
            List {
                ForEach(announcements) { announcement in
                    NavigationLink(value: Route.announcementDetails(id: announcement.id)) {
                        AnnouncementRow(announcement: announcement)
                    }
                }
            }
            .navigationTitle("Announcements")
            .refreshable {
                // TODO: Implement refresh
            }
        }
    }
}

struct AnnouncementRow: View {
    let announcement: Announcement
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(announcement.title)
                .font(.headline)
            
            Text(announcement.description)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineLimit(2)
            
            HStack {
                Text(announcement.author)
                    .font(.caption)
                    .foregroundColor(.blue)
                
                Spacer()
                
                Text(announcement.date, style: .date)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 8)
    }
}

struct AnnouncementDetailView: View {
    let announcementId: String
    @Environment(\.dismiss) private var dismiss
    
    // Sample data - will be replaced with real data
    private var announcement: Announcement {
        Announcement(
            id: announcementId,
            title: "COVID-19 Vaccination Update",
            description: """
            New vaccination schedules are now available for all age groups. Book your appointment now through our online portal or visit your nearest health center.
            
            Important points:
            - Bring valid ID
            - Wear mask
            - Come on time
            - Follow social distancing
            
            For more information, contact our helpline.
            """,
            date: Date(),
            author: "Health Department",
            imageUrl: nil
        )
    }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                if let imageUrl = announcement.imageUrl {
                    // TODO: Implement image loading
                    Color.gray
                        .frame(height: 200)
                }
                
                VStack(alignment: .leading, spacing: 12) {
                    Text(announcement.title)
                        .font(.title)
                        .bold()
                    
                    HStack {
                        Text(announcement.author)
                            .foregroundColor(.blue)
                        Spacer()
                        Text(announcement.date, style: .date)
                            .foregroundColor(.secondary)
                    }
                    .font(.subheadline)
                    
                    Divider()
                    
                    Text(announcement.description)
                        .font(.body)
                }
                .padding()
            }
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    AnnouncementsView()
} 