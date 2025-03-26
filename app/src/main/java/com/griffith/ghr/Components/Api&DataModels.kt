package com.griffith.ghr

import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Part

// ------------------------- API INTERFACE -------------------------

/**
 * Defines authentication API endpoints for Firebase login.
 */
interface AuthApi {
    @POST("api/auth/firebase-login")
    suspend fun firebaseLogin(@Body request: FirebaseLoginRequest): LoginResponse
}

/**
 * User Profile API interface for fetching user deliveries.
 */
interface UserProfileApi {
    @GET("api/auth/user")
    suspend fun getUserProfile(@Header("Authorization") token: String): UserProfile
}

interface UpdateTokenApi {
    @PUT("api/auth/updateToken")
    suspend fun updateToken(
        @Header("Authorization") token: String,
        @Body tokenData: Map<String, String>
    ): UpdateTokenResponse
}
/**
 * Delivery API interface for fetching user deliveries.
 */
interface DeliveryApi {
    @GET("api/auth/deliveries")
    suspend fun getDeliveries(@Header("Authorization") token: String): List<Delivery>
}

/**
 * Enquiry API interface for fetching user enquiries.
 */
interface EnquiryApi {
    @GET("api/auth/enquiries")
    suspend fun getEnquiries(@Header("Authorization") token: String): List<Enquiry>
}

/**
 * API interface for submitting Enquiry Requests.
 */
interface EnquiryRequestApi {
    @POST("api/auth/enquiries")
    suspend fun createEnquiryRequest(
        @Header("Authorization") token: String,
        @Body request: EnquiryRequestData
    ): EnquiryResponse
}

/**
 * Maintenance API interface for fetching maintenance requests.
 */
interface MaintenanceApi {
    @GET("api/maintenance/")
    suspend fun getMaintenanceRequests(@Header("Authorization") token: String): List<MaintenanceRequest>
}

/**
 * API interface for submitting Maintenance Requests.
 */
interface MaintenanceRequestApi {
    @Multipart
    @POST("api/maintenance/register")
    suspend fun createMaintenanceRequest(
        @Header("Authorization") token: String,
        @Part("roomNumber") roomNumber: RequestBody,
        @Part("category") category: RequestBody,
        @Part("description") description: RequestBody,
        @Part("roomAccess") roomAccess: RequestBody,
        @Part images: List<MultipartBody.Part>
    ): ResponseBody
}



// ------------------------- DATA MODEL & RESPONSES -------------------------

/**
 * Represents the Firebase login request payload.
 */
data class FirebaseLoginRequest(
    val idToken: String
)

/**
 * Represents the login response from the server.
 */
data class LoginResponse(
    val message: String,
    val token: String?
)
/**
 * Data class representing a user Profile item.
 */
data class UserProfile(
    val name: String,
    val lastName: String,
    val gender: String,
    val email: String,
    val phone: String? = null,
    val roomNumber: String,
    val profileImageUrl: String?,
    val fcmToken: String?
)
data class UpdateTokenResponse(
    val message: String,
    val user: UserProfile
)
/**
 * Data class representing a delivery item.
 */
data class Delivery(
    val arrivedAt: String,
    val parcelType: String,
    val parcelNumber: String,
    val status: String,
    val roomNumber: String,
    val sender: String?,
    val description: String?,
    val collectedAt: String?
)

/**
 * Data class representing an enquiry request.
 */
data class Enquiry(
    val requestId: String,
    val roomNumber: String,
    val enquiryText: String,
    val status: String,
    val response: String,
    val createdAt: String,
    val resolvedAt: String
)

/**
 * Data class for Enquiry request payload.
 */
data class EnquiryRequestData(
    val requestId: Int,
    val roomNumber: String,
    val enquiryText: String,
)

/**
 * Data class for Enquiry response.
 */
data class EnquiryResponse(
    val message: String,
    val request: EnquiryRequestData
)

/**
 * Data class representing a maintenance request.
 */
data class MaintenanceRequest(
    val requestId: String,
    val roomNumber: String,
    val category: String,
    val description: String,
    val roomAccess: String,
    val pictures: List<String>,
    val status: String,
    val createdAt: String,
    val completedAt: String?
)