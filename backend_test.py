import requests
import sys
import json
from datetime import datetime

class SGEBackendTester:
    def __init__(self, base_url="https://easy-desktop-app.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.professor_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_resources = {
            'courses': [],
            'turmas': [],
            'students': [],
            'users': []
        }

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
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

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

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin", "password": "#admin123%"}
        )
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            print(f"   Admin token obtained: {self.admin_token[:20]}...")
            return True
        return False

    def test_professor_login(self):
        """Test professor login"""
        success, response = self.run_test(
            "Professor Login",
            "POST",
            "auth/login",
            200,
            data={"email": "professor", "password": "#professor123%"}
        )
        if success and 'access_token' in response:
            self.professor_token = response['access_token']
            print(f"   Professor token obtained: {self.professor_token[:20]}...")
            return True
        return False

    def test_get_me_admin(self):
        """Test get current user info for admin"""
        return self.run_test("Get Admin Profile", "GET", "auth/me", 200, token=self.admin_token)

    def test_get_me_professor(self):
        """Test get current user info for professor"""
        return self.run_test("Get Professor Profile", "GET", "auth/me", 200, token=self.professor_token)

    def test_dashboard_metrics(self):
        """Test dashboard metrics"""
        return self.run_test("Dashboard Metrics", "GET", "dashboard/metrics", 200, token=self.admin_token)

    def test_get_courses(self):
        """Test get all courses"""
        return self.run_test("Get Courses", "GET", "courses", 200, token=self.admin_token)

    def test_create_course(self):
        """Test create course (admin only)"""
        course_data = {
            "name": f"Curso Teste {datetime.now().strftime('%H%M%S')}",
            "workload": 120,
            "description": "Curso criado para teste"
        }
        success, response = self.run_test(
            "Create Course",
            "POST",
            "courses",
            201,
            data=course_data,
            token=self.admin_token
        )
        if success and 'id' in response:
            self.created_resources['courses'].append(response['id'])
            return True, response
        return False, {}

    def test_get_turmas(self):
        """Test get all turmas"""
        return self.run_test("Get Turmas", "GET", "turmas", 200, token=self.admin_token)

    def test_create_turma(self):
        """Test create turma (admin only)"""
        # First get existing courses
        success, courses = self.run_test("Get Courses for Turma", "GET", "courses", 200, token=self.admin_token)
        if not success or not courses:
            print("❌ Cannot create turma - no courses available")
            return False, {}

        course_id = courses[0]['id']
        turma_data = {
            "name": f"Turma Teste {datetime.now().strftime('%H%M%S')}",
            "course_id": course_id,
            "period": "Manhã",
            "year": 2024
        }
        success, response = self.run_test(
            "Create Turma",
            "POST",
            "turmas",
            201,
            data=turma_data,
            token=self.admin_token
        )
        if success and 'id' in response:
            self.created_resources['turmas'].append(response['id'])
            return True, response
        return False, {}

    def test_get_students(self):
        """Test get all students"""
        return self.run_test("Get Students", "GET", "students", 200, token=self.admin_token)

    def test_create_student(self):
        """Test create student"""
        # First get existing turmas
        success, turmas = self.run_test("Get Turmas for Student", "GET", "turmas", 200, token=self.admin_token)
        if not success or not turmas:
            print("❌ Cannot create student - no turmas available")
            return False, {}

        turma_id = turmas[0]['id']
        student_data = {
            "name": f"Aluno Teste {datetime.now().strftime('%H%M%S')}",
            "email": f"aluno.teste.{datetime.now().strftime('%H%M%S')}@teste.com",
            "phone": "(11) 99999-9999",
            "birth_date": "2000-01-01",
            "turma_id": turma_id,
            "photo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        }
        success, response = self.run_test(
            "Create Student",
            "POST",
            "students",
            201,
            data=student_data,
            token=self.admin_token
        )
        if success and 'id' in response:
            self.created_resources['students'].append(response['id'])
            return True, response
        return False, {}

    def test_filter_students_by_turma(self):
        """Test filter students by turma"""
        # Get turmas first
        success, turmas = self.run_test("Get Turmas for Filter", "GET", "turmas", 200, token=self.admin_token)
        if success and turmas:
            turma_id = turmas[0]['id']
            return self.run_test(
                "Filter Students by Turma",
                "GET",
                f"students?turma_id={turma_id}",
                200,
                token=self.admin_token
            )
        return False, {}

    def test_filter_students_by_status(self):
        """Test filter students by status"""
        return self.run_test(
            "Filter Students by Status",
            "GET",
            "students?status_filter=active",
            200,
            token=self.admin_token
        )

    def test_professor_access_courses(self):
        """Test professor can access courses"""
        return self.run_test("Professor Access Courses", "GET", "courses", 200, token=self.professor_token)

    def test_professor_cannot_create_course(self):
        """Test professor cannot create courses"""
        course_data = {
            "name": "Curso Não Autorizado",
            "workload": 60,
            "description": "Teste de autorização"
        }
        return self.run_test(
            "Professor Cannot Create Course",
            "POST",
            "courses",
            403,  # Expecting forbidden
            data=course_data,
            token=self.professor_token
        )

    def test_institution_settings(self):
        """Test get institution settings"""
        return self.run_test("Get Institution Settings", "GET", "institution", 200, token=self.admin_token)

    def test_users_management(self):
        """Test users management (admin only)"""
        return self.run_test("Get Users", "GET", "users", 200, token=self.admin_token)

    def cleanup_resources(self):
        """Clean up created test resources"""
        print("\n🧹 Cleaning up test resources...")
        
        # Delete students
        for student_id in self.created_resources['students']:
            self.run_test(f"Delete Student {student_id}", "DELETE", f"students/{student_id}", 204, token=self.admin_token)
        
        # Delete turmas
        for turma_id in self.created_resources['turmas']:
            self.run_test(f"Delete Turma {turma_id}", "DELETE", f"turmas/{turma_id}", 204, token=self.admin_token)
        
        # Delete courses
        for course_id in self.created_resources['courses']:
            self.run_test(f"Delete Course {course_id}", "DELETE", f"courses/{course_id}", 204, token=self.admin_token)

def main():
    print("🚀 Starting SGE Backend API Tests")
    print("=" * 50)
    
    tester = SGEBackendTester()
    
    # Test sequence
    tests = [
        # Basic connectivity
        ("Health Check", tester.test_health_check),
        
        # Authentication
        ("Admin Login", tester.test_admin_login),
        ("Professor Login", tester.test_professor_login),
        ("Admin Profile", tester.test_get_me_admin),
        ("Professor Profile", tester.test_get_me_professor),
        
        # Dashboard
        ("Dashboard Metrics", tester.test_dashboard_metrics),
        
        # Courses CRUD
        ("Get Courses", tester.test_get_courses),
        ("Create Course", tester.test_create_course),
        
        # Turmas CRUD
        ("Get Turmas", tester.test_get_turmas),
        ("Create Turma", tester.test_create_turma),
        
        # Students CRUD
        ("Get Students", tester.test_get_students),
        ("Create Student", tester.test_create_student),
        ("Filter Students by Turma", tester.test_filter_students_by_turma),
        ("Filter Students by Status", tester.test_filter_students_by_status),
        
        # Authorization tests
        ("Professor Access Courses", tester.test_professor_access_courses),
        ("Professor Cannot Create Course", tester.test_professor_cannot_create_course),
        
        # Other endpoints
        ("Institution Settings", tester.test_institution_settings),
        ("Users Management", tester.test_users_management),
    ]
    
    failed_tests = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            if isinstance(result, tuple):
                success = result[0]
            else:
                success = result
            
            if not success:
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
            failed_tests.append(test_name)
    
    # Cleanup
    tester.cleanup_resources()
    
    # Print results
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS")
    print("=" * 50)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if failed_tests:
        print(f"\n❌ Failed tests:")
        for test in failed_tests:
            print(f"   - {test}")
    else:
        print("\n✅ All tests passed!")
    
    return 0 if len(failed_tests) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())