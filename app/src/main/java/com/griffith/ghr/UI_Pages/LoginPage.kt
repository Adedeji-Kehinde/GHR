package com.griffith.ghr

import android.content.Context
import android.util.Log
import android.widget.Toast
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
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory


// ------------------------- Login Page UI -------------------------

/**
 * LoginPage composable function.
 * Handles user login and navigation upon successful authentication.
 */
@Composable
fun LoginPage(navController: NavController) {
    val email = remember { mutableStateOf("") }
    val password = remember { mutableStateOf("") }
    val isLoading = remember { mutableStateOf(false) }
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current

    // Initialize Retrofit instance once
    val authApi = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com") // Backend URL
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(AuthApi::class.java)
    }

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

            // Login Button
            Button(
                onClick = {
                    coroutineScope.launch {
                        isLoading.value = true
                        performLogin(
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
        }
    }
}

// ------------------------- Helper Functions -------------------------

/**
 * Handles login request and navigation.
 */
private suspend fun performLogin(
    authApi: AuthApi,
    email: String,
    password: String,
    context: Context,
    navController: NavController,
    isLoading: MutableState<Boolean>
) {
    try {
        val response = authApi.login(LoginRequest(email, password))

        if (response.token != null) {
            // Store authentication token in shared preferences
            val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
            sharedPreferences.edit().putString("authToken", response.token).apply()

            Toast.makeText(context, "Login Successful", Toast.LENGTH_LONG).show()
            navController.navigate("HomePage")
        } else {
            Toast.makeText(context, "Error: ${response.message}", Toast.LENGTH_LONG).show()
        }
    } catch (e: Exception) {
        Log.e("LoginError", "Error during login", e)
        Toast.makeText(context, "Error: ${e.message}", Toast.LENGTH_LONG).show()
    } finally {
        isLoading.value = false
    }
}
