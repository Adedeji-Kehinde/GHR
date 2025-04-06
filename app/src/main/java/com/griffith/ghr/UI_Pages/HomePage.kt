package com.griffith.ghr

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
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
    val isNotificationDrawerOpen = remember { mutableStateOf(false) }
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
                        onNotificationClick = {
                            isNotificationDrawerOpen.value = true
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
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Red)
            .padding(innerPadding)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Large card for "My Deliveries"
            LargeCard(
                title = "My Deliveries",
                subtitle = "",
                icon = painterResource(id = R.drawable.deliveries),
                onClick = { navController.navigate("deliveriesPage") }
            )
            // Row with two smaller cards side by side
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
            // Large card for "Useful Information"
            LargeCard(
                title = "Useful Information",
                subtitle = "Find out more information",
                icon = painterResource(id = R.drawable.info),
                onClick = { navController.navigate("usefulInfoPage") }
            )
        }
    }
}
