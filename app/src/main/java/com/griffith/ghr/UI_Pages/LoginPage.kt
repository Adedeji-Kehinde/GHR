package com.griffith.ghr

import android.app.Activity.RESULT_OK
import android.content.Context
import android.util.Log
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.google.android.gms.auth.api.signin.*
import com.google.android.gms.common.api.ApiException
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

@Composable
fun LoginPage(navController: NavController) {
    val email = remember { mutableStateOf("") }
    val password = remember { mutableStateOf("") }
    val isLoading = remember { mutableStateOf(false) }
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current

    // Initialize Retrofit instance for backend API
    val authApi = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com") // Use your backend URL
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(AuthApi::class.java)
    }

    // Firebase Auth instance
    val firebaseAuth = FirebaseAuth.getInstance()

    // --- Google Sign-In Setup ---
    // Configure Google SignInOptions; ensure you have defined default_web_client_id in your strings.xml
    val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
        .requestIdToken(context.getString(R.string.default_web_client_id))
        .requestEmail()
        .build()
    val googleSignInClient = GoogleSignIn.getClient(context, gso)

    // Launcher for Google Sign-In intent
    val googleSignInLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
            try {
                val account = task.getResult(ApiException::class.java)
                val idToken = account?.idToken
                if (idToken != null) {
                    coroutineScope.launch {
                        isLoading.value = true
                        try {
                            val response = authApi.firebaseLogin(FirebaseLoginRequest(idToken))
                            response.token?.let { token ->
                                val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
                                sharedPreferences.edit().putString("authToken", token).apply()
                                Toast.makeText(context, "Login Successful", Toast.LENGTH_LONG).show()
                                val role = response.message  // Assume role info is in message or adjust accordingly
                                if (role == "admin") {
                                    navController.navigate("AdminDashboard")
                                } else {
                                    navController.navigate("HomePage")
                                }
                            } ?: run {
                                Toast.makeText(context, "Error: ${response.message}", Toast.LENGTH_LONG).show()
                            }
                        } catch (e: Exception) {
                            Log.e("GoogleLoginError", "Error during Google login", e)
                            Toast.makeText(context, "Google login failed", Toast.LENGTH_LONG).show()
                        } finally {
                            isLoading.value = false
                        }
                    }
                }
            } catch (e: ApiException) {
                Log.e("GoogleLogin", "Google sign in failed", e)
                Toast.makeText(context, "Google sign in failed", Toast.LENGTH_LONG).show()
            }
        }
    }

    // UI Layout
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .padding(16.dp)
                .background(Color.LightGray.copy(alpha = 0.1f), shape = RoundedCornerShape(8.dp))
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Title
            Text(
                text = "Login",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Email Input
            OutlinedTextField(
                value = email.value,
                onValueChange = { email.value = it },
                label = { Text("Email") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Password Input
            OutlinedTextField(
                value = password.value,
                onValueChange = { password.value = it },
                label = { Text("Password") },
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(modifier = Modifier.height(24.dp))

            // Login Button (Email/Password)
            Button(
                onClick = {
                    coroutineScope.launch {
                        isLoading.value = true
                        performFirebaseLogin(
                            authApi = authApi,
                            email = email.value,
                            password = password.value,
                            context = context,
                            navController = navController,
                            isLoading = isLoading
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp),
                enabled = !isLoading.value
            ) {
                if (isLoading.value) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Text(text = "Login")
                }
            }
            Spacer(modifier = Modifier.height(16.dp))

            // Google Login Button
            Button(
                onClick = {
                    // Launch the Google Sign-In Intent
                    val signInIntent = googleSignInClient.signInIntent
                    googleSignInLauncher.launch(signInIntent)
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(text = "Continue with Google")
            }
        }
    }
}

/**
 * Helper suspend function to perform Firebase Email/Password login,
 * get the Firebase ID token, and call the backend endpoint.
 */
private suspend fun performFirebaseLogin(
    authApi: AuthApi,
    email: String,
    password: String,
    context: Context,
    navController: NavController,
    isLoading: MutableState<Boolean>
) {
    try {
        val firebaseAuth = FirebaseAuth.getInstance()
        val authResult = firebaseAuth.signInWithEmailAndPassword(email, password).await()
        val idTokenResult = authResult.user?.getIdToken(true)?.await()

        if (idTokenResult != null) {
            try {
                val response = authApi.firebaseLogin(FirebaseLoginRequest(idTokenResult.token!!))
                if (response.token != null) {
                    // If the user role is admin, block login
                    if (response.message == "admin") {
                        Toast.makeText(context, "Admins cannot log in with this app.", Toast.LENGTH_LONG).show()
                        return
                    }

                    val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
                    sharedPreferences.edit().putString("authToken", response.token).apply()

                    // 🔥 Now check the user's bookings
                    val retrofit = Retrofit.Builder()
                        .baseUrl("https://ghr-1.onrender.com")
                        .addConverterFactory(GsonConverterFactory.create())
                        .build()

                    val bookingApi = retrofit.create(BookingApi::class.java)
                    val userProfileApi = retrofit.create(UserProfileApi::class.java)

                    // Get user's profile to get their user ID
                    val userProfile = userProfileApi.getUserProfile("Bearer ${response.token}")

                    // Now get bookings
                    val bookings = bookingApi.getBookings("Bearer ${response.token}")

                    // Check if the user has at least one booking with status "Booked"
                    val hasActiveBooking = bookings.any { booking ->
                        booking.userReference.id == userProfile.id && booking.status == "Booked"
                    }

                    if (hasActiveBooking) {
                        Toast.makeText(context, "Login Successful", Toast.LENGTH_LONG).show()
                        navController.navigate("HomePage")
                    } else {
                        Toast.makeText(context, "No active booking found. Please complete make a booking to access App features.", Toast.LENGTH_LONG).show()
                        // Optionally clear the token
                        sharedPreferences.edit().remove("authToken").apply()
                    }
                } else {
                    Toast.makeText(context, "Error: ${response.message}", Toast.LENGTH_LONG).show()
                }
            } catch (e: retrofit2.HttpException) {
                Toast.makeText(context, "Login failed: ${e.message()}", Toast.LENGTH_LONG).show()
            }
        } else {
            Toast.makeText(context, "Error: Unable to get Firebase ID token", Toast.LENGTH_LONG).show()
        }
    } catch (e: Exception) {
        Log.e("LoginError", "Error during login", e)
        Toast.makeText(context, "Error: ${e.message}", Toast.LENGTH_LONG).show()
    } finally {
        isLoading.value = false
    }
}
