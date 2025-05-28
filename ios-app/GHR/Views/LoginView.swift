import SwiftUI

struct LoginView: View {
    @State private var email = ""
    @State private var password = ""
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [Color.blue.opacity(0.6), Color.purple.opacity(0.4)]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 25) {
                    // App Logo
                    Image(systemName: "heart.text.square.fill")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 100, height: 100)
                        .foregroundColor(.white)
                        .padding(.top, 50)
                    
                    Text("Welcome Back")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(.white)
                    
                    // Login Form
                    VStack(spacing: 20) {
                        // Email field
                        TextField("Email", text: $email)
                            .textFieldStyle(RoundedTextFieldStyle())
                            .autocapitalization(.none)
                            .keyboardType(.emailAddress)
                        
                        // Password field
                        SecureField("Password", text: $password)
                            .textFieldStyle(RoundedTextFieldStyle())
                        
                        // Login button
                        Button(action: {
                            // TODO: Implement login
                        }) {
                            Text("Sign In")
                                .font(.headline)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                                .background(Color.blue)
                                .cornerRadius(25)
                        }
                        
                        // Google Sign In button
                        Button(action: {
                            // TODO: Implement Google Sign In
                        }) {
                            HStack {
                                Image(systemName: "g.circle.fill")
                                    .foregroundColor(.blue)
                                Text("Sign in with Google")
                                    .foregroundColor(.primary)
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(Color(UIColor.systemBackground))
                            .cornerRadius(25)
                            .shadow(radius: 3)
                        }
                    }
                    .padding(.horizontal, 30)
                }
            }
        }
    }
}

// Custom text field style
struct RoundedTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding(15)
            .background(Color(UIColor.systemBackground))
            .cornerRadius(25)
            .shadow(radius: 3)
    }
}

#Preview {
    LoginView()
} 