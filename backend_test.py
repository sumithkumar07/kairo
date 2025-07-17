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
        
        if success and 'user' in response and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            self.session.headers.update({'Authorization': f'Bearer {self.token}'})
            self.log(f"   User ID: {self.user_id}")
            self.log(f"   Token: {self.token[:20]}...")
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
        
        if success and 'user' in response and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            self.session.headers.update({'Authorization': f'Bearer {self.token}'})
            return True
        return False

    def test_get_current_user(self):
        """Test get current user endpoint"""
        if not self.token:
            self.log("❌ No token available for authentication test", "FAIL")
            return False
            
        # Test with cookie (as the app uses cookies)
        cookies = {'session-token': self.token}
        
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "api/auth/me",
            200,
            headers={'Cookie': f'session-token={self.token}'}
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
        # Remove authorization header temporarily
        original_headers = self.session.headers.copy()
        if 'Authorization' in self.session.headers:
            del self.session.headers['Authorization']
        
        success, response = self.run_test(
            "Unauthorized Access Test",
            "GET",
            "api/auth/me",
            401  # Expecting 401 for unauthorized access
        )
        
        # Restore headers
        self.session.headers = original_headers
        return success

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
            ("Invalid Credentials", self.test_invalid_credentials),
            ("Duplicate Email Signup", self.test_duplicate_signup),
            ("Missing Required Fields", self.test_missing_fields),
            ("Unauthorized Access", self.test_unauthorized_access),
            ("Non-existent User Profile", self.test_nonexistent_user_profile),
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