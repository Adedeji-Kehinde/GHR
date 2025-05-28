import SwiftUI

enum Route {
    case login
    case home
    case announcements
    case announcementDetails(id: String)
    case profile
}

struct MainNavigation: View {
    @State private var path = NavigationPath()
    
    var body: some View {
        NavigationStack(path: $path) {
            LoginView()
                .navigationDestination(for: Route.self) { route in
                    switch route {
                    case .login:
                        LoginView()
                    case .home:
                        HomeView()
                    case .announcements:
                        AnnouncementsView()
                    case .announcementDetails(let id):
                        AnnouncementDetailView(announcementId: id)
                    case .profile:
                        ProfileView()
                    }
                }
        }
    }
} 