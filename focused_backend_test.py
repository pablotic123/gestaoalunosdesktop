import requests
import sys
import json

class SGEFocusedTester:
    def __init__(self, base_url="https://easy-desktop-app.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json() if response.content else {}
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

def main():
    print("🚀 SGE Backend - Focused API Tests")
    print("Testing specific endpoints from review request")
    print("=" * 60)
    
    tester = SGEFocusedTester()
    
    # Test 1: Health Check
    print("\n1. Health Check: GET /api/health")
    success, _ = tester.run_test("Health Check", "GET", "health", 200)
    
    # Test 2: Admin Login
    print("\n2. Login: POST /api/auth/login")
    success, response = tester.run_test(
        "Admin Login",
        "POST",
        "auth/login",
        200,
        data={"email": "admin", "password": "#admin123%"}
    )
    
    admin_token = None
    if success and 'access_token' in response:
        admin_token = response['access_token']
        print(f"   ✓ Admin token obtained: {admin_token[:20]}...")
    
    # Test 3: Get Current User
    print("\n3. Get Current User: GET /api/auth/me")
    if admin_token:
        tester.run_test("Get Current User", "GET", "auth/me", 200, token=admin_token)
    else:
        print("❌ Skipped - No admin token available")
    
    # Test 4: List Courses
    print("\n4. List Courses: GET /api/courses")
    if admin_token:
        tester.run_test("List Courses", "GET", "courses", 200, token=admin_token)
    else:
        print("❌ Skipped - No admin token available")
    
    # Test 5: List Turmas
    print("\n5. List Turmas: GET /api/turmas")
    if admin_token:
        tester.run_test("List Turmas", "GET", "turmas", 200, token=admin_token)
    else:
        print("❌ Skipped - No admin token available")
    
    # Test 6: Dashboard Metrics
    print("\n6. Dashboard Metrics: GET /api/dashboard/metrics")
    if admin_token:
        tester.run_test("Dashboard Metrics", "GET", "dashboard/metrics", 200, token=admin_token)
    else:
        print("❌ Skipped - No admin token available")
    
    # Test 7: Institution Settings (bonus test)
    print("\n7. Institution Settings: GET /api/institution")
    if admin_token:
        tester.run_test("Institution Settings", "GET", "institution", 200, token=admin_token)
    else:
        print("❌ Skipped - No admin token available")
    
    # Print results
    print("\n" + "=" * 60)
    print("📊 FOCUSED TEST RESULTS")
    print("=" * 60)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("\n✅ ALL TESTS PASSED! SGE Backend is working correctly.")
        return 0
    else:
        print(f"\n❌ {tester.tests_run - tester.tests_passed} test(s) failed.")
        return 1

if __name__ == "__main__":
    sys.exit(main())