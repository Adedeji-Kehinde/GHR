import SwiftUI

struct WelcomeView: View {
    var body: some View {
        ZStack {
            // Gradient background
            LinearGradient(
                gradient: Gradient(colors: [Color.blue.opacity(0.6), Color.purple.opacity(0.4)]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 30) {
                // App icon/logo
                Image(systemName: "heart.text.square.fill")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 120, height: 120)
                    .foregroundColor(.white)
                
                // Welcome text
                Text("Welcome to GHR")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.white)
                
                Text("Your Global Health Records")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(.white.opacity(0.9))
                
                Spacer().frame(height: 40)
                
                // Get Started button
                Button(action: {
                    // TODO: Implement navigation to main screen
                }) {
                    Text("Get Started")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.blue)
                        .frame(width: 280, height: 50)
                        .background(Color.white)
                        .cornerRadius(25)
                        .shadow(radius: 5)
                }
            }
            .padding()
        }
    }
} 