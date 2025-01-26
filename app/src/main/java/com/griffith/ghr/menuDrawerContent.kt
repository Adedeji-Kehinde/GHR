package com.griffith.ghr

import android.content.Context
import android.util.Log
import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.font.FontWeight
import androidx.navigation.NavController
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Header

// Data class for user details
data class UserDetails(
    val name: String,
    val lastName: String,
    val email: String
)

// Retrofit API interface
interface UserApi {
    @GET("api/auth/user") // Replace with your endpoint
    suspend fun getUserDetails(@Header("Authorization") token: String): UserDetails
}

@Composable
fun MenuDrawerContent(navController: NavController) {
    val placeholderImage: Painter = painterResource(id = R.drawable.app_logo)
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    // State for user data
    var userName by remember { mutableStateOf("Loading...") }
    var userEmail by remember { mutableStateOf("Loading...") }

    // Initialize Retrofit
    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com") // Replace with your backend URL
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    val userApi = retrofit.create(UserApi::class.java)

    // Fetch user details on first composition
    LaunchedEffect(Unit) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)

        if (token != null) {
            coroutineScope.launch {
                try {
                    val userDetails = userApi.getUserDetails("Bearer $token")
                    userName = "${userDetails.name} ${userDetails.lastName}"
                    userEmail = userDetails.email
                } catch (e: Exception) {
                    Log.e("MenuDrawerContent", "Error fetching user details", e)
                    Toast.makeText(
                        context,
                        "Failed to fetch user details. Please try again.",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        } else {
            Toast.makeText(
                context,
                "No authentication token found. Please log in again.",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxHeight()
            .width(280.dp)
            .padding(16.dp)
    ) {
        // User profile section
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { navController.navigate("UserProfilePage") }, // Navigate to UserProfilePage
            verticalAlignment = Alignment.CenterVertically
        ) {
            // User profile image in a circular shape
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .background(Color.Gray, shape = CircleShape)
            ) {
                // Always use the placeholder image
                Image(
                    painter = placeholderImage,
                    contentDescription = "User Profile Image",
                    modifier = Modifier.fillMaxSize()
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            // User name and email
            Column {
                Text(
                    text = userName,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                Text(
                    text = userEmail,
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
        }
        Spacer(modifier = Modifier.height(8.dp)) // Add space below the profile section
        HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
        Spacer(modifier = Modifier.height(16.dp)) // Add space below the profile section

        // Menu items
        LazyColumn(modifier = Modifier.weight(1f)) { // Occupy remaining space
            item {
                ListItem(
                    headlineContent = {
                        Text(text = "Home", fontSize = 20.sp)
                    },
                    modifier = Modifier.clickable {
                        navController.navigate("HomePage") // Navigate to HomePage
                    }
                )
            }
            item {
                Spacer(modifier = Modifier.height(16.dp)) // Add space between items
            }
            item {
                ListItem(
                    headlineContent = {
                        Text(text = "Deliveries", fontSize = 20.sp)
                    },
                    modifier = Modifier.clickable {
                        navController.navigate("DeliveriesPage") // Navigate to DeliveriesPage
                    }
                )
            }
            item {
                Spacer(modifier = Modifier.height(16.dp)) // Add space between items
            }
            item {
                ListItem(
                    headlineContent = {
                        Text(text = "Maintenance", fontSize = 20.sp)
                    },
                    modifier = Modifier.clickable {
                        navController.navigate("MaintenancePage") // Navigate to MaintenancePage
                    }
                )
            }
            item {
                Spacer(modifier = Modifier.height(16.dp)) // Add space between items
            }
            item {
                ListItem(
                    headlineContent = {
                        Text(text = "Enquiries", fontSize = 20.sp)
                    },
                    modifier = Modifier.clickable {
                        navController.navigate("EnquiriesPage") // Navigate to EnquiriesPage
                    }
                )
            }
        }

        // Logout Button
        Text(
            text = "Logout",
            fontSize = 14.sp,
            color = Color.Gray,
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
                .clickable {
                    // Clear the token and navigate to LoginPage
                    val sharedPreferences =
                        context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
                    sharedPreferences.edit().remove("authToken").apply()
                    navController.navigate("LoginPage") {
                        popUpTo(0) // Clear the back stack
                    }
                },
            textAlign = androidx.compose.ui.text.style.TextAlign.Start
        )
    }
}
