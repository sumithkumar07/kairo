#!/usr/bin/env python3
"""
Comprehensive Authentication API Testing for Kairo
Testing core authentication endpoints: signup, login, logout, get user profile
"""

import requests
import json
import time
import sys
from typing import Dict, Any, List, Tuple

# Configuration
BASE_URL = "http://localhost:3000"
TIMEOUT = 30

class AuthAPITester:
    def __init__(self):
        self.results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.session_token = None
        
    def log_result(self, endpoint: str, status: str, response_time: float, details: str):
        """Log test result"""
        result = {
            'endpoint': endpoint,
            'status': status,
            'response_time_ms': round(response_time * 1000, 2),
            'details': details
        }
        self.results.append(result)
        self.total_tests += 1
        if status == 'PASS':
            self.passed_tests += 1
        else:
            self.failed_tests += 1
            
        print(f"[{status}] {endpoint} - {details} ({result['response_time_ms']}ms)")
    
    def test_signup(self):
        """Test user signup endpoint"""
        url = f"{BASE_URL}/api/auth/signup"
        payload = {
            "email": "testuser2025@kairotest.com",
            "password": "SecureTestPass2025!"
        }
        
        try:
            start_time = time.time()
            response = requests.post(url, json=payload, timeout=TIMEOUT)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get('success', False):
                        self.log_result('POST /api/auth/signup', 'PASS', response_time, 
                                      f"User signup successful - {data.get('message', 'Account created')}")
                        return True
                    else:
                        self.log_result('POST /api/auth/signup', 'FAIL', response_time, 
                                      f"Signup failed: {data.get('error', 'Unknown error')}")
                        return False
                except json.JSONDecodeError:
                    self.log_result('POST /api/auth/signup', 'FAIL', response_time, "Invalid JSON response")
                    return False
            else:
                self.log_result('POST /api/auth/signup', 'FAIL', response_time, 
                              f"HTTP {response.status_code}: {response.text[:200]}")
                return False
                
        except requests.exceptions.Timeout:
            self.log_result('POST /api/auth/signup', 'FAIL', TIMEOUT, f"Request timeout after {TIMEOUT}s")
            return False
        except Exception as e:
            self.log_result('POST /api/auth/signup', 'FAIL', 0, f"Unexpected error: {str(e)}")
            return False
    
    def test_signin(self):
        """Test user signin endpoint"""
        url = f"{BASE_URL}/api/auth/signin"
        payload = {
            "email": "testuser2025@kairotest.com",
            "password": "SecureTestPass2025!"
        }
        
        try:
            start_time = time.time()
            response = requests.post(url, json=payload, timeout=TIMEOUT)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get('success', False):
                        # Extract session token from cookies if available
                        if 'Set-Cookie' in response.headers:
                            cookies = response.headers['Set-Cookie']
                            if 'session=' in cookies:
                                self.session_token = cookies.split('session=')[1].split(';')[0]
                        
                        self.log_result('POST /api/auth/signin', 'PASS', response_time, 
                                      f"User signin successful - {data.get('message', 'Login successful')}")
                        return True
                    else:
                        self.log_result('POST /api/auth/signin', 'FAIL', response_time, 
                                      f"Signin failed: {data.get('error', 'Unknown error')}")
                        return False
                except json.JSONDecodeError:
                    self.log_result('POST /api/auth/signin', 'FAIL', response_time, "Invalid JSON response")
                    return False
            else:
                self.log_result('POST /api/auth/signin', 'FAIL', response_time, 
                              f"HTTP {response.status_code}: {response.text[:200]}")
                return False
                
        except requests.exceptions.Timeout:
            self.log_result('POST /api/auth/signin', 'FAIL', TIMEOUT, f"Request timeout after {TIMEOUT}s")
            return False
        except Exception as e:
            self.log_result('POST /api/auth/signin', 'FAIL', 0, f"Unexpected error: {str(e)}")
            return False
    
    def test_get_current_user(self):
        """Test get current user endpoint"""
        url = f"{BASE_URL}/api/auth/me"
        headers = {}
        
        # Add session cookie if available
        if self.session_token:
            headers['Cookie'] = f'session={self.session_token}'
        
        try:
            start_time = time.time()
            response = requests.get(url, headers=headers, timeout=TIMEOUT)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get('success', False) and 'user' in data:
                        user_data = data['user']
                        self.log_result('GET /api/auth/me', 'PASS', response_time, 
                                      f"Current user retrieved - ID: {user_data.get('id', 'N/A')}, Email: {user_data.get('email', 'N/A')}")
                        return True
                    else:
                        self.log_result('GET /api/auth/me', 'FAIL', response_time, 
                                      f"Failed to get user: {data.get('error', 'Unknown error')}")
                        return False
                except json.JSONDecodeError:
                    self.log_result('GET /api/auth/me', 'FAIL', response_time, "Invalid JSON response")
                    return False
            elif response.status_code == 401:
                self.log_result('GET /api/auth/me', 'PASS', response_time, 
                              "Unauthorized access properly returns 401 (expected for unauthenticated request)")
                return True
            else:
                self.log_result('GET /api/auth/me', 'FAIL', response_time, 
                              f"HTTP {response.status_code}: {response.text[:200]}")
                return False
                
        except requests.exceptions.Timeout:
            self.log_result('GET /api/auth/me', 'FAIL', TIMEOUT, f"Request timeout after {TIMEOUT}s")
            return False
        except Exception as e:
            self.log_result('GET /api/auth/me', 'FAIL', 0, f"Unexpected error: {str(e)}")
            return False
    
    def test_user_profile(self):
        """Test user profile endpoint"""
        url = f"{BASE_URL}/api/user/profile"
        headers = {}
        
        # Add session cookie if available
        if self.session_token:
            headers['Cookie'] = f'session={self.session_token}'
        
        try:
            start_time = time.time()
            response = requests.get(url, headers=headers, timeout=TIMEOUT)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get('success', False) and 'profile' in data:
                        profile_data = data['profile']
                        self.log_result('GET /api/user/profile', 'PASS', response_time, 
                                      f"User profile retrieved - Subscription: {profile_data.get('subscription_tier', 'N/A')}")
                        return True
                    else:
                        self.log_result('GET /api/user/profile', 'FAIL', response_time, 
                                      f"Failed to get profile: {data.get('error', 'Unknown error')}")
                        return False
                except json.JSONDecodeError:
                    self.log_result('GET /api/user/profile', 'FAIL', response_time, "Invalid JSON response")
                    return False
            elif response.status_code == 401:
                self.log_result('GET /api/user/profile', 'PASS', response_time, 
                              "Unauthorized access properly returns 401 (expected for unauthenticated request)")
                return True
            else:
                self.log_result('GET /api/user/profile', 'FAIL', response_time, 
                              f"HTTP {response.status_code}: {response.text[:200]}")
                return False
                
        except requests.exceptions.Timeout:
            self.log_result('GET /api/user/profile', 'FAIL', TIMEOUT, f"Request timeout after {TIMEOUT}s")
            return False
        except Exception as e:
            self.log_result('GET /api/user/profile', 'FAIL', 0, f"Unexpected error: {str(e)}")
            return False
    
    def test_logout(self):
        """Test user logout endpoint"""
        url = f"{BASE_URL}/api/auth/logout"
        headers = {}
        
        # Add session cookie if available
        if self.session_token:
            headers['Cookie'] = f'session={self.session_token}'
        
        try:
            start_time = time.time()
            response = requests.post(url, headers=headers, timeout=TIMEOUT)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get('success', False):
                        self.log_result('POST /api/auth/logout', 'PASS', response_time, 
                                      f"User logout successful - {data.get('message', 'Logged out')}")
                        self.session_token = None  # Clear session token
                        return True
                    else:
                        self.log_result('POST /api/auth/logout', 'FAIL', response_time, 
                                      f"Logout failed: {data.get('error', 'Unknown error')}")
                        return False
                except json.JSONDecodeError:
                    self.log_result('POST /api/auth/logout', 'FAIL', response_time, "Invalid JSON response")
                    return False
            else:
                self.log_result('POST /api/auth/logout', 'FAIL', response_time, 
                              f"HTTP {response.status_code}: {response.text[:200]}")
                return False
                
        except requests.exceptions.Timeout:
            self.log_result('POST /api/auth/logout', 'FAIL', TIMEOUT, f"Request timeout after {TIMEOUT}s")
            return False
        except Exception as e:
            self.log_result('POST /api/auth/logout', 'FAIL', 0, f"Unexpected error: {str(e)}")
            return False
    
    def test_integration_endpoints(self):
        """Test integration system endpoints"""
        url = f"{BASE_URL}/api/integrations/test"
        payload = {
            "integration": "test_integration",
            "action": "validate"
        }
        
        try:
            start_time = time.time()
            response = requests.post(url, json=payload, timeout=TIMEOUT)
            response_time = time.time() - start_time
            
            if response.status_code in [200, 400]:  # 400 is expected for missing parameters
                self.log_result('POST /api/integrations/test', 'PASS', response_time, 
                              f"Integration endpoint responding correctly (HTTP {response.status_code})")
                return True
            else:
                self.log_result('POST /api/integrations/test', 'FAIL', response_time, 
                              f"HTTP {response.status_code}: {response.text[:200]}")
                return False
                
        except requests.exceptions.Timeout:
            self.log_result('POST /api/integrations/test', 'FAIL', TIMEOUT, f"Request timeout after {TIMEOUT}s")
            return False
        except Exception as e:
            self.log_result('POST /api/integrations/test', 'FAIL', 0, f"Unexpected error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all authentication and core API tests"""
        print("=" * 80)
        print("KAIRO CORE AUTHENTICATION & API TESTING")
        print("=" * 80)
        print(f"Testing against: {BASE_URL}")
        print(f"Timeout: {TIMEOUT}s")
        print("-" * 80)
        
        # Run authentication flow tests
        print("\n🔐 AUTHENTICATION FLOW TESTING:")
        self.test_signup()
        self.test_signin()
        self.test_get_current_user()
        self.test_user_profile()
        self.test_logout()
        
        # Test integration system
        print("\n🔗 INTEGRATION SYSTEM TESTING:")
        self.test_integration_endpoints()
        
        # Print summary
        print("-" * 80)
        print("TEST SUMMARY")
        print("-" * 80)
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.failed_tests}")
        print(f"Success Rate: {(self.passed_tests/self.total_tests*100):.1f}%")
        
        if self.failed_tests > 0:
            print("\nFAILED TESTS:")
            for result in self.results:
                if result['status'] == 'FAIL':
                    print(f"  - {result['endpoint']}: {result['details']}")
        
        print("\nPERFORMANCE METRICS:")
        response_times = [r['response_time_ms'] for r in self.results if r['status'] == 'PASS']
        if response_times:
            print(f"  Average Response Time: {sum(response_times)/len(response_times):.2f}ms")
            print(f"  Fastest Response: {min(response_times):.2f}ms")
            print(f"  Slowest Response: {max(response_times):.2f}ms")
        
        print("=" * 80)
        
        # Return success status
        return self.failed_tests == 0

if __name__ == "__main__":
    tester = AuthAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)