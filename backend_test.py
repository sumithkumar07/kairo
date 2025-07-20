#!/usr/bin/env python3
"""
Kairo AI Workflow Automation - Backend API Testing Suite
Tests all API endpoints and database integration
"""

import requests
import sys
import json
from datetime import datetime
import time

class KairoAPITester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        self.token = None
        self.user_id = None
        self.test_email = f"test_user_{int(time.time())}@example.com"
        self.test_password = "TestPass123!"
        self.tests_run = 0
        self.tests_passed = 0

    def log(self, message, status="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] [{status}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = self.session.headers.copy()
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"Testing {name}...")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}", "PASS")
                try:
                    response_data = response.json()
                    return True, response_data
                except:
                    return True, {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                try:
                    error_data = response.json()
                    self.log(f"   Error: {error_data}", "ERROR")
                except:
                    self.log(f"   Response: {response.text}", "ERROR")
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Exception: {str(e)}", "FAIL")
            return False, {}

    def test_signup(self):
        """Test user signup endpoint"""
        success, response = self.run_test(
            "User Signup",
            "POST",
            "api/auth/signup",
            200,
            data={
                "email": self.test_email,
                "password": self.test_password
            }
        )
        
        if success and 'user' in response:
            # For Next.js API, token is set as HTTP-only cookie, not in response
            self.user_id = response['user']['id']
            self.log(f"   User ID: {self.user_id}")
            self.log(f"   User Email: {response['user']['email']}")
            return True
        return False

    def test_signin(self):
        """Test user signin endpoint"""
        success, response = self.run_test(
            "User Signin",
            "POST",
            "api/auth/signin",
            200,
            data={
                "email": self.test_email,
                "password": self.test_password
            }
        )
        
        if success and 'user' in response:
            # For Next.js API, token is set as HTTP-only cookie, not in response
            self.user_id = response['user']['id']
            self.log(f"   User ID: {self.user_id}")
            self.log(f"   User Email: {response['user']['email']}")
            return True
        return False

    def test_get_current_user(self):
        """Test get current user endpoint"""
        # Since we're using HTTP-only cookies, the session should be maintained automatically
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "api/auth/me",
            200
        )
        
        if success and 'email' in response:
            self.log(f"   Current user: {response['email']}")
            return True
        return False

    def test_get_user_profile(self):
        """Test get user profile endpoint"""
        if not self.user_id:
            self.log("❌ No user ID available for profile test", "FAIL")
            return False
            
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            f"api/user/profile/{self.user_id}",
            200
        )
        
        if success and 'subscription_tier' in response:
            self.log(f"   Subscription tier: {response['subscription_tier']}")
            self.log(f"   Trial end date: {response.get('trial_end_date', 'None')}")
            return True
        return False

    def test_invalid_credentials(self):
        """Test signin with invalid credentials"""
        success, response = self.run_test(
            "Invalid Credentials Test",
            "POST",
            "api/auth/signin",
            400,  # Expecting 400 for invalid credentials
            data={
                "email": "invalid@example.com",
                "password": "wrongpassword"
            }
        )
        return success

    def test_duplicate_signup(self):
        """Test signup with existing email"""
        success, response = self.run_test(
            "Duplicate Email Signup",
            "POST",
            "api/auth/signup",
            400,  # Expecting 400 for duplicate email
            data={
                "email": self.test_email,  # Same email as before
                "password": "AnotherPass123!"
            }
        )
        return success

    def test_missing_fields(self):
        """Test API endpoints with missing required fields"""
        # Test signup without email
        success1, _ = self.run_test(
            "Signup Missing Email",
            "POST",
            "api/auth/signup",
            400,
            data={"password": "TestPass123!"}
        )
        
        # Test signin without password
        success2, _ = self.run_test(
            "Signin Missing Password",
            "POST",
            "api/auth/signin",
            400,
            data={"email": "test@example.com"}
        )
        
        return success1 and success2

    def test_unauthorized_access(self):
        """Test accessing protected endpoints without authentication"""
        # Create a new session without cookies to test unauthorized access
        temp_session = requests.Session()
        temp_session.headers.update({'Content-Type': 'application/json'})
        
        url = f"{self.base_url}/api/auth/me"
        self.tests_run += 1
        self.log(f"Testing Unauthorized Access Test...")
        
        try:
            response = temp_session.get(url)
            success = response.status_code == 401
            
            if success:
                self.tests_passed += 1
                self.log(f"✅ Unauthorized Access Test - Status: {response.status_code}", "PASS")
                return True
            else:
                self.log(f"❌ Unauthorized Access Test - Expected 401, got {response.status_code}", "FAIL")
                try:
                    error_data = response.json()
                    self.log(f"   Error: {error_data}", "ERROR")
                except:
                    self.log(f"   Response: {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Unauthorized Access Test - Exception: {str(e)}", "FAIL")
            return False

    def test_logout(self):
        """Test user logout endpoint"""
        success, response = self.run_test(
            "User Logout",
            "POST",
            "api/auth/logout",
            200
        )
        
        if success and 'message' in response:
            self.log(f"   Logout message: {response['message']}")
            return True
        return False

    def test_mistral_api_workflow(self):
        """Test Mistral AI workflow generation endpoint"""
        success, response = self.run_test(
            "Mistral AI Workflow Generation",
            "POST",
            "api/test-mistral",
            200,
            data={
                "type": "workflow",
                "prompt": "Create a simple workflow to send an email notification"
            }
        )
        
        if success and 'success' in response:
            self.log(f"   AI workflow generation: {'Success' if response['success'] else 'Failed'}")
            return True
        return False

    def test_mistral_api_chat(self):
        """Test Mistral AI chat endpoint"""
        success, response = self.run_test(
            "Mistral AI Chat",
            "POST",
            "api/test-mistral",
            200,
            data={
                "type": "chat",
                "prompt": "Hello, how can you help me with workflow automation?"
            }
        )
        
        if success and 'success' in response:
            self.log(f"   AI chat: {'Success' if response['success'] else 'Failed'}")
            return True
        return False

    def test_integration_test_missing_params(self):
        """Test integration test endpoint with missing parameters"""
        success, response = self.run_test(
            "Integration Test Missing Params",
            "POST",
            "api/integrations/test",
            400,
            data={}
        )
        return success

    def test_scheduler_unauthorized(self):
        """Test scheduler endpoint without proper authentication"""
        success, response = self.run_test(
            "Scheduler Unauthorized Access",
            "POST",
            "api/scheduler/run",
            401,
            data={}
        )
        return success

    def test_scheduler_authorized(self):
        """Test scheduler endpoint with proper authentication"""
        # Get the scheduler secret key from environment
        scheduler_secret = "scheduler_secret_key_2024_secure_random_key_for_cron_jobs"
        
        success, response = self.run_test(
            "Scheduler Authorized Access",
            "POST",
            "api/scheduler/run",
            200,
            data={},
            headers={"Authorization": f"Bearer {scheduler_secret}"}
        )
        
        if success and 'message' in response:
            self.log(f"   Scheduler message: {response['message']}")
            self.log(f"   Workflows checked: {response.get('workflowsChecked', 0)}")
            self.log(f"   Workflows triggered: {response.get('workflowsTriggered', 0)}")
            return True
        return False

    def test_nonexistent_user_profile(self):
        """Test getting profile for non-existent user"""
        fake_user_id = "00000000-0000-0000-0000-000000000000"
        success, response = self.run_test(
            "Non-existent User Profile",
            "GET",
            f"api/user/profile/{fake_user_id}",
            404  # Expecting 404 for non-existent user
        )
        return success

    def run_all_tests(self):
        """Run all API tests"""
        self.log("🚀 Starting Kairo API Test Suite", "START")
        self.log(f"Base URL: {self.base_url}")
        self.log(f"Test Email: {self.test_email}")
        
        # Test sequence
        tests = [
            ("User Registration", self.test_signup),
            ("User Authentication", self.test_signin),
            ("Get Current User", self.test_get_current_user),
            ("Get User Profile", self.test_get_user_profile),
            ("User Logout", self.test_logout),
            ("Invalid Credentials", self.test_invalid_credentials),
            ("Duplicate Email Signup", self.test_duplicate_signup),
            ("Missing Required Fields", self.test_missing_fields),
            ("Unauthorized Access", self.test_unauthorized_access),
            ("Non-existent User Profile", self.test_nonexistent_user_profile),
            ("Mistral AI Workflow Generation", self.test_mistral_api_workflow),
            ("Mistral AI Chat", self.test_mistral_api_chat),
            ("Integration Test Missing Params", self.test_integration_test_missing_params),
            ("Scheduler Unauthorized Access", self.test_scheduler_unauthorized),
            ("Scheduler Authorized Access", self.test_scheduler_authorized),
        ]
        
        self.log("=" * 60)
        
        for test_name, test_func in tests:
            self.log(f"Running: {test_name}")
            try:
                result = test_func()
                if not result:
                    self.log(f"❌ {test_name} failed", "FAIL")
            except Exception as e:
                self.log(f"❌ {test_name} threw exception: {str(e)}", "ERROR")
            
            self.log("-" * 40)
        
        # Print final results
        self.log("=" * 60)
        self.log(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed", "RESULT")
        
        if self.tests_passed == self.tests_run:
            self.log("🎉 All tests passed!", "SUCCESS")
            return 0
        else:
            self.log(f"❌ {self.tests_run - self.tests_passed} tests failed", "FAIL")
            return 1

def main():
    """Main function"""
    print("Kairo AI Workflow Automation - Backend API Test Suite")
    print("=" * 60)
    
    # Test with localhost (development)
    tester = KairoAPITester("http://localhost:3000")
    result = tester.run_all_tests()
    
    return result

if __name__ == "__main__":
    sys.exit(main())