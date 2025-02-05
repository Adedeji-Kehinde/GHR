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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import coil.compose.rememberAsyncImagePainter
import coil.request.ImageRequest
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

// ------------------------- MENU DRAWER -------------------------

/**
 * Sidebar Menu Drawer - Displays user profile and navigation options.
 */
@Composable
fun MenuDrawerContent(navController: NavController) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    // State for storing user details
    var userName by remember { mutableStateOf("Loading...") }
    var userEmail by remember { mutableStateOf("Loading...") }
    var profileImageUrl by remember { mutableStateOf("") }

    // Retrofit API setup
    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val userProfileApi = retrofit.create(UserProfileApi::class.java)

    // Fetch user details when the composable is first displayed
    LaunchedEffect(Unit) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)

        if (token != null) {
            coroutineScope.launch {
                try {
                    val userDetails = userProfileApi.getUserProfile("Bearer $token")
                    userName = "${userDetails.name} ${userDetails.lastName}"
                    userEmail = userDetails.email
                    profileImageUrl = userDetails.profileImageUrl.takeIf { it?.isNotEmpty() == true }
                        ?: "https://res.cloudinary.com/dxlrv28eb/user_profiles/default_Image.JPG"
                } catch (e: Exception) {
                    Log.e("MenuDrawerContent", "Error fetching user details", e)
                    Toast.makeText(context, "Failed to fetch profile details.", Toast.LENGTH_LONG).show()
                }
            }
        } else {
            Toast.makeText(context, "No authentication token found. Please log in again.", Toast.LENGTH_LONG).show()
        }
    }

    Column(modifier = Modifier.fillMaxHeight().width(280.dp).padding(16.dp))
    {
        // User profile section
        ProfileSection(
            userName = userName,
            userEmail = userEmail,
            profileImageUrl = profileImageUrl,
            onClick = { navController.navigate("UserProfilePage") }
        )

        Spacer(modifier = Modifier.height(8.dp))
        HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
        Spacer(modifier = Modifier.height(16.dp))

        // Navigation Menu Items
        LazyColumn(modifier = Modifier.weight(1f)) {
            item {
                MenuItem(navController, painterResource(id = R.drawable.home), "Home", "HomePage")
            }
            item { Spacer(modifier = Modifier.height(20.dp)) }
            item {
                MenuItem(navController, painterResource(id = R.drawable.deliveries), "Deliveries", "DeliveriesPage")
            }
            item { Spacer(modifier = Modifier.height(20.dp)) }
            item {
                MenuItem(navController, painterResource(id = R.drawable.maintenance), "Maintenance", "MaintenancePage")
            }
            item { Spacer(modifier = Modifier.height(20.dp)) }
            item {
                MenuItem(navController, painterResource(id = R.drawable.enquiries), "Enquiries", "EnquiriesPage")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Logout Button
        LogoutButton(navController = navController, context = context)
    }
}

// ------------------------- PROFILE SECTION -------------------------

/**
 * User Profile Section in the Sidebar Menu
 */
@Composable
fun ProfileSection(userName: String, userEmail: String, profileImageUrl: String, onClick: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().clickable { onClick() },
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Profile Image using Coil
        Image(
            painter = rememberAsyncImagePainter(
                ImageRequest.Builder(LocalContext.current)
                    .data(profileImageUrl)
                    .crossfade(true)
                    .build()
            ),
            contentDescription = "User Profile Image",
            modifier = Modifier.size(60.dp).clip(CircleShape).background(Color.Gray, shape = CircleShape),
            contentScale = ContentScale.Crop
        )

        Spacer(modifier = Modifier.width(16.dp))

        Column {
            Text(text = userName, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.Black)
            Text(text = userEmail, fontSize = 14.sp, color = Color.Gray)
        }
    }
}

// ------------------------- MENU ITEMS -------------------------

/**
 * Reusable Navigation Menu Item
 */
@Composable
fun MenuItem(navController: NavController, icon: Painter, title: String, route: String) {
    Row(
        modifier = Modifier.fillMaxWidth().clickable { navController.navigate(route) }.padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(painter = icon, contentDescription = title, tint = Color.Black, modifier = Modifier.size(24.dp))
        Spacer(modifier = Modifier.width(16.dp))
        Text(text = title, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.Black)
    }
}

// ------------------------- LOGOUT BUTTON -------------------------

/**
 * Logout Button - Clears authentication token and navigates to Login Page.
 */
@Composable
fun LogoutButton(navController: NavController, context: Context) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(8.dp)
            .clickable {
                val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
                sharedPreferences.edit().remove("authToken").apply()
                navController.navigate("LoginPage") { popUpTo(0) }
                Toast.makeText(context, "Logged out successfully.", Toast.LENGTH_LONG).show()
            },
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(painter = painterResource(id = R.drawable.logout), contentDescription = "Logout", tint = Color.Gray, modifier = Modifier.size(24.dp))
        Spacer(modifier = Modifier.width(8.dp))
        Text(text = "Logout", fontSize = 16.sp, color = Color.Gray, fontWeight = FontWeight.Medium)
    }
}
