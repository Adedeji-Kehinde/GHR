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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
                .clickable { navController.navigate("UserProfilePage") },
            verticalAlignment = Alignment.CenterVertically
        ) {
            // User profile image
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .background(Color.Gray, shape = CircleShape)
            ) {
                Image(
                    painter = placeholderImage,
                    contentDescription = "User Profile Image",
                    modifier = Modifier.fillMaxSize()
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
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

        Spacer(modifier = Modifier.height(8.dp))
        HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
        Spacer(modifier = Modifier.height(16.dp))

        // Menu items with icons
        LazyColumn(modifier = Modifier.weight(1f)) {
            item {
                MenuItem(
                    navController = navController,
                    icon = painterResource(id = R.drawable.home), // Replace with actual icon
                    title = "Home",
                    route = "HomePage"
                )
            }
            item { Spacer(modifier = Modifier.height(20.dp)) }
            item {
                MenuItem(
                    navController = navController,
                    icon = painterResource(id = R.drawable.deliveries), // Replace with actual icon
                    title = "Deliveries",
                    route = "DeliveriesPage"
                )
            }
            item { Spacer(modifier = Modifier.height(20.dp)) }
            item {
                MenuItem(
                    navController = navController,
                    icon = painterResource(id = R.drawable.maintenance), // Replace with actual icon
                    title = "Maintenance",
                    route = "MaintenancePage"
                )
            }
            item { Spacer(modifier = Modifier.height(20.dp)) }
            item {
                MenuItem(
                    navController = navController,
                    icon = painterResource(id = R.drawable.enquiries), // Replace with actual icon
                    title = "Enquiries",
                    route = "EnquiriesPage"
                )
            }
        }

        // Logout Button
        Row(
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
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                painter = painterResource(id = R.drawable.logout), // Replace with actual icon
                contentDescription = "Logout",
                tint = Color.Gray,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Logout",
                fontSize = 16.sp,
                color = Color.Gray,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

// Reusable Menu Item
@Composable
fun MenuItem(navController: NavController, icon: Painter, title: String, route: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { navController.navigate(route) }
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            painter = icon,
            contentDescription = title,
            tint = Color.Black,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.width(16.dp))
        Text(
            text = title,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black
        )
    }
}
