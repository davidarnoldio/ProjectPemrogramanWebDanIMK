const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log(`=== RUNNING TESTS ON ${BASE_URL} ===`);

  console.log("\n1. Testing POST /api/qr/rotate...");
  const rotateRes = await fetch(`${BASE_URL}/api/qr/rotate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: "55555555-5555-5555-5555-555555555501" }),
  });
  const rotateData = await rotateRes.json();
  console.log("Status:", rotateRes.status);
  console.log("Token Generated:", rotateData.token ? `${rotateData.token.substring(0, 16)}...` : null);
  console.log("Expires At:", rotateData.expiresAt);
  console.log("Validity Seconds:", rotateData.validitySeconds);

  if (rotateData.token) {
    console.log("\n2. Testing POST /api/attendance/scan with fresh 5s token...");
    const scanRes = await fetch(`${BASE_URL}/api/attendance/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "55555555-5555-5555-5555-555555555501",
        token: rotateData.token,
        studentNim: "10124001",
      }),
    });
    const scanData = await scanRes.json();
    console.log("Scan Status:", scanRes.status);
    console.log("Scan Result:", scanData.message || scanData.error);
    if (scanData.data) {
      console.log("Student:", scanData.data.studentName, "(NIM: " + scanData.data.studentNim + ")");
      console.log("Parent WhatsApp Target:", scanData.data.parentPhone);
    }
  }

  console.log("\n3. Testing GET /api/admin/schedules...");
  const schedRes = await fetch(`${BASE_URL}/api/admin/schedules`);
  const schedData = await schedRes.json();
  console.log("Schedules Count:", schedData.length);
  console.log("First Class:", schedData[0]?.class_name, "-", schedData[0]?.courses?.name);

  console.log("\n4. Testing GET /api/admin/lecturers...");
  const lectRes = await fetch(`${BASE_URL}/api/admin/lecturers`);
  const lectData = await lectRes.json();
  console.log("Lecturers Count:", lectData.length);

  console.log("\n5. Testing GET /api/admin/students...");
  const studRes = await fetch(`${BASE_URL}/api/admin/students`);
  const studData = await studRes.json();
  console.log("Students Count:", studData.length);
  console.log("Parent Phone format:", studData[0]?.parent_phone);
}

runTests();
