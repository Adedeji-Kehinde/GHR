import SwiftUI

@main
struct GHRApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    
    var body: some Scene {
        WindowGroup {
            HomeView()
        }
    }
} 