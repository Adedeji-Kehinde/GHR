// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "GHR",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "GHR",
            targets: ["GHR"]
        )
    ],
    targets: [
        .target(
            name: "GHR",
            dependencies: [],
            path: "Sources"
        )
    ]
) 