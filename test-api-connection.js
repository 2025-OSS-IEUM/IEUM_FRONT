/**
 * 백엔드 API 서버와 MongoDB 연동 확인용 테스트 스크립트
 * 
 * 사용법:
 * 1. 터미널에서 실행: node test-api-connection.js
 * 2. 또는 백엔드 팀원에게 이 스크립트를 보여주고 확인 요청
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://lakisha-techiest-unmercurially.ngrok-free.dev";

console.log("백엔드 API 서버 연결 테스트");
console.log("API 서버 URL:", API_BASE_URL);
console.log("");

// 1. 서버 상태 확인 (Health Check)
async function testServerHealth() {
  try {
    ("1️⃣ 서버 상태 확인 중...");
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("서버가 정상 작동 중입니다:", data);
      return true;
    } else {
      console.log("서버 응답:", response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log("서버 연결 실패:", error.message);
    console.log("   → 백엔드 서버가 실행 중인지 확인하세요");
    return false;
  }
}

// 2. 제보 목록 조회 테스트 (인증 없이)
async function testGetReports() {
  try {
    console.log("\n2️⃣ 제보 목록 조회 테스트 중...");
    const response = await fetch(
      `${API_BASE_URL}/reports/?min_lon=-180&min_lat=-90&max_lon=180&max_lat=90&limit=5`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log("제보 목록 조회 성공!");
      console.log("   받은 제보 개수:", Array.isArray(data) ? data.length : "N/A");
      console.log("   → MongoDB에서 데이터를 가져온 것으로 보입니다");
      return true;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log("제보 목록 조회 실패:", response.status, errorData);
      return false;
    }
  } catch (error) {
    console.log("제보 목록 조회 실패:", error.message);
    return false;
  }
}

// 3. 제보 생성 테스트 (인증 필요할 수 있음)
async function testCreateReport() {
  try {
    console.log("\n3️⃣ 제보 생성 테스트 중...");
    const testReport = {
      type: "test",
      description: "테스트 제보입니다 - MongoDB 연동 확인용",
      location: {
        type: "Point",
        coordinates: [127.0276, 37.4979], // 서울 좌표
      },
      severity: "low",
      status: "pending",
    };
    
    const response = await fetch(`${API_BASE_URL}/reports/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testReport),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("제보 생성 성공!");
      console.log("   생성된 제보 ID:", data.id);
      console.log("   → MongoDB에 저장된 것으로 보입니다");
      console.log("\n백엔드 팀원에게 확인 요청:");
      console.log("   - MongoDB에서 이 제보가 저장되었는지 확인");
      console.log("   - 제보 ID:", data.id);
      return true;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log("제보 생성 실패:", response.status, errorData);
      if (response.status === 401) {
        console.log("   → 인증이 필요합니다. 로그인 후 다시 시도하세요");
      }
      return false;
    }
  } catch (error) {
    console.log("제보 생성 실패:", error.message);
    return false;
  }
}

// 메인 실행
async function main() {
  console.log("=".repeat(50));
  console.log("백엔드 API 서버와 MongoDB 연동 확인 테스트");
  console.log("=".repeat(50));
  console.log("");
  
  const healthOk = await testServerHealth();
  if (!healthOk) {
    console.log("\n⚠️ 서버가 응답하지 않습니다. 백엔드 서버가 실행 중인지 확인하세요.");
    return;
  }
  
  await testGetReports();
  await testCreateReport();
  
  console.log("\n" + "=".repeat(50));
  console.log("테스트 완료!");
  console.log("=".repeat(50));
  console.log("\n확인 사항:");
  console.log("1. 위의 테스트 결과를 확인하세요");
  console.log("2. 제보 생성이 성공했다면, 백엔드 팀원에게 MongoDB 확인을 요청하세요");
  console.log("3. 앱에서 제보를 생성하면 같은 방식으로 MongoDB에 저장됩니다");
}

main().catch(console.error);

