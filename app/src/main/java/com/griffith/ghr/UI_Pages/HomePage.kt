package com.griffith.ghr

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

// Retrofit setup function using your base URL
fun provideRetrofit(): Retrofit {
    return Retrofit.Builder()
        .baseUrl("https://ghr-1.onrender.com/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
}

// ------------------------- Home Page -------------------------

/**
 * HomePage - The main screen containing navigation drawers, header, and home content.
 */
@Composable
fun HomePage(navController: NavController) {
    val scope = rememberCoroutineScope()
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)
    val context = LocalContext.current

    // Retrieve and update FCM token when HomePage is launched
    LaunchedEffect(Unit) {
        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (!task.isSuccessful) {
                println("Fetching FCM registration token failed: ${task.exception}")
                return@addOnCompleteListener
            }
            val fcmToken = task.result
            println("FCM Registration token: $fcmToken")
            // Retrieve JWT token from SharedPreferences
            val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
            val jwtToken = sharedPreferences.getString("authToken", null)
            if (jwtToken != null) {
                sendTokenToServer(fcmToken, jwtToken)
            } else {
                println("JWT token not found")
            }
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        ModalNavigationDrawer(
            drawerState = menuDrawerState,
            drawerContent = {
                ModalDrawerSheet {
                    MenuDrawerContent(navController = navController)
                }
            },
            modifier = Modifier.fillMaxSize()
        ) {
            Scaffold(
                topBar = {
                    AppHeader(
                        onMenuClick = {
                            scope.launch { menuDrawerState.open() }
                        },
                        navController = navController,
                        showBackButton = false
                    )
                },
                content = { innerPadding ->
                    HomePageContent(navController = navController, innerPadding = innerPadding)
                }
            )
        }
    }
}

// Function to call the API and update the FCM token on the backend using the stored JWT token
fun sendTokenToServer(fcmToken: String, jwtToken: String) {
    val retrofit = provideRetrofit()
    val updateTokenApi = retrofit.create(UpdateTokenApi::class.java)

    // Prepare the token data as a map
    val tokenData = mapOf("fcmToken" to fcmToken)

    // Use a coroutine to call the API
    CoroutineScope(Dispatchers.IO).launch {
        try {
            // Append "Bearer " to the token as required by your backend
            val authHeader = "Bearer $jwtToken"
            val response = updateTokenApi.updateToken(authHeader, tokenData)
            println("FCM token updated on server: $response")
        } catch (e: Exception) {
            println("Error updating token on server: ${e.message}")
        }
    }
}

// ------------------------- Home Page Content -------------------------

/**
 * HomePageContent - Displays the main content inside the Home Page.
 */
@Composable
fun HomePageContent(navController: NavController, innerPadding: PaddingValues) {
    // Announcements state; Announcement is your data class for announcements
    val announcements = remember { mutableStateOf<List<Announcement>>(emptyList()) }

    // Fetch announcements on load
    LaunchedEffect(Unit) {
        val retrofit = provideRetrofit()
        // AnnouncementApi is your Retrofit interface for announcements
        val announcementApi = retrofit.create(AnnouncementApi::class.java)
        try {
            val result = announcementApi.getAnnouncements()
            // Filter to include only approved announcements
            announcements.value = result.filter { it.approved }
        } catch (e: Exception) {
            println("Error fetching announcements: ${e.message}")
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Red)
            .padding(innerPadding)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Announcements Section at the top; shows only approved announcements
            AnnouncementsSection(
                announcements = announcements.value,
                onSeeAllClick = { navController.navigate("announcementsList") },
                onAnnouncementClick = { announcement ->
                    navController.navigate("announcementDetails/${announcement.id.toString()}")
                }
            )
            // Rest of your Home Page cards
            LargeCard(
                title = "My Deliveries",
                subtitle = "",
                icon = painterResource(id = R.drawable.deliveries),
                onClick = { navController.navigate("deliveriesPage") }
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                SmallCard(
                    title = "Maintenance",
                    subtitle = "Have an issue?",
                    icon = painterResource(id = R.drawable.maintenance),
                    onClick = { navController.navigate("maintenancePage") },
                    modifier = Modifier.weight(1f)
                )
                SmallCard(
                    title = "Enquiries",
                    subtitle = "Ask us anything",
                    icon = painterResource(id = R.drawable.enquiries),
                    onClick = { navController.navigate("enquiriesPage") },
                    modifier = Modifier.weight(1f)
                )
            }
            LargeCard(
                title = "Useful Information",
                subtitle = "Find out more information",
                icon = painterResource(id = R.drawable.info),
                onClick = { navController.navigate("usefulInfoPage") }
            )
        }
    }
}

@Composable
fun AnnouncementsSection(
    announcements: List<Announcement>,
    onSeeAllClick: () -> Unit,
    onAnnouncementClick: (Announcement) -> Unit
) {
    // Display only the top three approved announcements
    val topThree = announcements.take(3)

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // "Announcements" header with larger, bold white text
            Text(
                text = "Announcements",
                style = MaterialTheme.typography.titleLarge.copy(
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )
            )
            // "See All" button with rounded edge border
            Box(
                modifier = Modifier
                    .clickable { onSeeAllClick() }
                    .border(
                        width = 1.dp,
                        color = Color.White,
                        shape = MaterialTheme.shapes.small
                    )
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "See All",
                    style = MaterialTheme.typography.bodyMedium.copy(color = Color.White)
                )
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        topThree.forEach { announcement ->
            AnnouncementItem(
                announcement = announcement,
                onClick = {
                    // Convert the id explicitly to String.
                    onAnnouncementClick(announcement)
                },
                textColor = Color.White
            )
            Divider(modifier = Modifier.padding(vertical = 8.dp), color = Color.White.copy(alpha = 0.5f))
        }
    }
}

@Composable
fun AnnouncementItem(
    announcement: Announcement,
    onClick: () -> Unit,
    textColor: Color
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Text(
            text = announcement.title,
            fontWeight = FontWeight.Bold,
            style = MaterialTheme.typography.bodyLarge.copy(color = textColor)
        )
        Text(
            text = formatDateTime(announcement.createdAt),
            style = MaterialTheme.typography.bodySmall.copy(color = textColor)
        )
    }
}


