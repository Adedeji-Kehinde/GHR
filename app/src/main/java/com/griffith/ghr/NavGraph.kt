package com.griffith.ghr

import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument

@Composable
fun NavGraph() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = "splashScreen"
    ) {
        //Navigate to Splash Screen
        composable("SplashScreen") { SplashScreen(navController = navController) }

        // Navigate to Login page
        composable("LoginPage") { LoginPage(navController) }

        // Navigate to Home page
        composable("HomePage") { HomePage(navController) }

        // Navigate to Deliveries page
        composable("DeliveriesPage") { DeliveriesPage(navController) }

        // Navigate to Delivery Details page
        composable(
            "DeliveryDetailsPage/{parcelNumber}",
            arguments = listOf(navArgument("parcelNumber") { type = NavType.StringType })
        ) { backStackEntry ->
            DeliveryDetailsPage(
                navController = navController,
                parcelNumber = backStackEntry.arguments?.getString("parcelNumber") ?: ""
            )
        }

        // Navigate to Maintenance page
        composable("MaintenancePage") { MaintenancePage(navController) }

        // Navigate to Add Maintenance page
        composable("MaintenanceRequestPage") { MaintenanceRequestPage(navController) }

        // Navigate to Maintenance Details page
        composable(
            route = "MaintenanceRequestDetailsPage/{requestId}",
            arguments = listOf(navArgument("requestId") { type = NavType.StringType })
        ) { backStackEntry ->
            val requestId = backStackEntry.arguments?.getString("requestId")
            requestId?.let {
                MaintenanceRequestDetailsPage(navController = navController, requestId = it)
            }
        }

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
