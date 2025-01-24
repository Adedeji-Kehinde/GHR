package com.griffith.ghr

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController

@Composable
fun NavGraph() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = "LoginPage"
    ) {
        // Navigate to Login page
        composable("LoginPage") { LoginPage(navController) }

        // Navigate to Home page
        composable("HomePage") { HomePage(navController) }

        // Navigate to Deliveries page
        composable("DeliveriesPage") { DeliveriesPage(navController) }

        // Navigate to Maintenance page
        composable("MaintenancePage") { MaintenancePage(navController) }

        // Navigate to Add Maintenance page
        composable("MaintenanceRequestPage") { MaintenanceRequestPage(navController) }

        // Navigate to Enquiries page
        composable("EnquiriesPage") { EnquiriesPage(navController) }

        // Navigate to Enquiries Request page
        composable("EnquiriesRequestPage") { EnquiriesRequestPage(navController) }

        // Navigate to Useful Information page
        composable("UsefulInfoPage") { UsefulInfoPage(navController) }

        // Navigate to User Profile page
        composable("UserProfilePage") { UserProfilePage(navController) }
    }
}
