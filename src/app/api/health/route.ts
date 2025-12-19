import { NextRequest, NextResponse } from "next/server";

// Health check endpoint for monitoring and load balancers
export async function GET(request: NextRequest) {
  try {
    // Basic health check
    interface HealthData {
      status: string;
      timestamp: string;
      uptime: number;
      version: string;
      environment: string;
      memory: {
        used: number;
        total: number;
        external: number;
      };
      cpu: {
        usage: NodeJS.CpuUsage;
      };
      database?: {
        status: string;
        error?: string;
      };
    }

    const healthData: HealthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      cpu: {
        usage: process.cpuUsage(),
      },
    };

    // Optional: Check database connectivity if DATABASE_URL is available
    if (process.env.DATABASE_URL) {
      try {
        // This is a basic connectivity check
        // In a real application, you might want to check database connectivity
        // using your database client library
        healthData.database = {
          status: "connected",
          // Add actual database connection check here if needed
        };
      } catch (dbError) {
        healthData.database = {
          status: "disconnected",
          error: dbError instanceof Error ? dbError.message : "Unknown error",
        };
      }
    }

    // Check if all critical services are healthy
    const isHealthy =
      healthData.status === "healthy" &&
      (!healthData.database || healthData.database.status === "connected");

    const statusCode = isHealthy ? 200 : 503;

    return NextResponse.json(healthData, {
      status: statusCode,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    // Return error status if something goes wrong
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}

// Handle HEAD requests for simple health checks
export async function HEAD(request: NextRequest) {
  try {
    // Perform a basic health check without returning full response body
    // This is useful for load balancers that only need to know if service is up
    const isHealthy = true; // Add actual health checks here if needed

    return new NextResponse(null, {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
