#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Kairo Authentication System
Testing critical auth endpoints and functionality
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "http://localhost:3000"
TIMEOUT = 30

class AuthAPITester:
    def __init__(self):
        self.results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.session = requests.Session()
        
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
    
    def test_health_endpoint(self):
        """Test health endpoint"""
        url = f"{BASE_URL}/api/health"
        
        try:
            start_time = time.time()
            response = self.session.get(url, timeout=TIMEOUT)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_result('GET /api/health', 'PASS', response_time, 
                                  f"Health check successful - Status: {data.get('data', {}).get('status', 'unknown')}")
                else:
                    self.log_result('GET /api/health', 'FAIL', response_time, 
                                  f"Health check returned success=false")
            else:
                self.log_result('GET /api/health', 'FAIL', response_time, 
                              f"HTTP {response.status_code}: {response.text[:200]}")
                
        except Exception as e:
            self.log_result('GET /api/health', 'FAIL', 0, f"Error: {str(e)}")
    
    def test_signup_validation(self):
        """Test signup endpoint validation"""
        url = f"{BASE_URL}/api/auth/signup"
        
        # Test 1: Missing required fields
        try:
            start_time = time.time()
            response = self.session.post(url, json={}, timeout=TIMEOUT)
            response_time = time.time() - start_time
            
            if response.status_code == 400:
                self.log_result('POST /api/auth/signup (validation)', 'PASS', response_time, 
                              "Correctly rejected empty payload")
            else:
                self.log_result('POST /api/auth/signup (validation)', 'FAIL', response_time, 
                              f"Expected 400, got {response.status_code}")
                
        except Exception as e:
            self.log_result('POST /api/auth/signup (validation)', 'FAIL', 0, f"Error: {str(e)}")
        
        # Test 2: Invalid email format
        try:
            start_time = time.time()
            response = self.session.post(url, json={
                "email": "invalid-email",
                "password": "testpass123",
                "name": "Test User"
            }, timeout=TIMEOUT)
            response_time = time.time() - start_time
            
            if response.status_code == 400:
                self.log_result('POST /api/auth/signup (invalid email)', 'PASS', response_time, 
                              "Correctly rejected invalid email")
            else:
                self.log_result('POST /api/auth/signup (invalid email)', 'FAIL', response_time, 
                              f"Expected 400, got {response.status_code}")
                
        except Exception as e:
            self.log_result('POST /api/auth/signup (invalid email)', 'FAIL', 0, f"Error: {str(e)}")
    
    def test_signup_success(self):
        """Test successful signup"""
        url = f"{BASE_URL}/api/auth/signup"
        test_email = f"test_{int(time.time())}@example.com"
        
        try:
            start_time = time.time()
            response = self.session.post(url, json={
                "email": test_email,
                "password": "testpass123",
                "name": "Test User"
            }, timeout=TIMEOUT)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data and 'user' in data['data']:
                    self.log_result('POST /api/auth/signup (success)', 'PASS', response_time, 
                                  f"Successfully created user: {data['data']['user'].get('email', 'unknown')}")
                    return test_email  # Return for signin test
                else:
                    self.log_result('POST /api/auth/signup (success)', 'FAIL', response_time, 
                                  f"Missing expected response structure: {data}")
            else:
                self.log_result('POST /api/auth/signup (success)', 'FAIL', response_time, 
                              f"HTTP {response.status_code}: {response.text[:200]}")
                
        except Exception as e:
            self.log_result('POST /api/auth/signup (success)', 'FAIL', 0, f"Error: {str(e)}")
        
        return None
    
    def test_signin_validation(self):
        """Test signin endpoint validation"""
        url = f"{BASE_URL}/api/auth/signin"
        
        # Test 1: Missing credentials
        try:
            start_time = time.time()
            response = self.session.post(url, json={}, timeout=TIMEOUT)
            response_time = time.time() - start_time
            
            if response.status_code == 400:
                self.log_result('POST /api/auth/signin (validation)', 'PASS', response_time, 
                              "Correctly rejected empty credentials")
            else:
                self.log_result('POST /api/auth/signin (validation)', 'FAIL', response_time, 
                              f"Expected 400, got {response.status_code}")
                
        except Exception as e:
            self.log_result('POST /api/auth/signin (validation)', 'FAIL', 0, f"Error: {str(e)}")
        
        # Test 2: Invalid credentials
        try:
            start_time = time.time()
            response = self.session.post(url, json={
                "email": "nonexistent@example.com",
                "password": "wrongpassword"
            }, timeout=TIMEOUT)
            response_time = time.time() - start_time
            
            if response.status_code == 400:
                self.log_result('POST /api/auth/signin (invalid creds)', 'PASS', response_time, 
                              "Correctly rejected invalid credentials")
            else:
                self.log_result('POST /api/auth/signin (invalid creds)', 'FAIL', response_time, 
                              f"Expected 400, got {response.status_code}")
                
        except Exception as e:
            self.log_result('POST /api/auth/signin (invalid creds)', 'FAIL', 0, f"Error: {str(e)}")
    
    def test_signin_success(self, email: str):
        """Test successful signin with created user"""
        if not email:
            self.log_result('POST /api/auth/signin (success)', 'SKIP', 0, 
                          "Skipped - no valid user email from signup test")
            return
        
        url = f"{BASE_URL}/api/auth/signin"
        
        try:
            start_time = time.time()
            response = self.session.post(url, json={
                "email": email,
                "password": "testpass123"
            }, timeout=TIMEOUT)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if 'user' in data and data['user'].get('email') == email:
                    self.log_result('POST /api/auth/signin (success)', 'PASS', response_time, 
                                  f"Successfully signed in user: {email}")
                else:
                    self.log_result('POST /api/auth/signin (success)', 'FAIL', response_time, 
                                  f"Missing expected response structure: {data}")
            else:
                self.log_result('POST /api/auth/signin (success)', 'FAIL', response_time, 
                              f"HTTP {response.status_code}: {response.text[:200]}")
                
        except Exception as e:
            self.log_result('POST /api/auth/signin (success)', 'FAIL', 0, f"Error: {str(e)}")
    
    def test_auth_me_endpoint(self):
        """Test /api/auth/me endpoint"""
        url = f"{BASE_URL}/api/auth/me"
        
        try:
            start_time = time.time()
            response = self.session.get(url, timeout=TIMEOUT)
            response_time = time.time() - start_time
            
            # Should return 401 if not authenticated, or 200 if authenticated
            if response.status_code in [200, 401]:
                if response.status_code == 200:
                    data = response.json()
                    self.log_result('GET /api/auth/me', 'PASS', response_time, 
                                  f"Authenticated user: {data.get('email', 'unknown')}")
                else:
                    self.log_result('GET /api/auth/me', 'PASS', response_time, 
                                  "Correctly returned 401 for unauthenticated request")
            else:
                self.log_result('GET /api/auth/me', 'FAIL', response_time, 
                              f"Unexpected status code: {response.status_code}")
                
        except Exception as e:
            self.log_result('GET /api/auth/me', 'FAIL', 0, f"Error: {str(e)}")
    
    def run_all_tests(self):
        """Run all authentication API tests"""
        print("=" * 80)
        print("KAIRO AUTHENTICATION API TESTING")
        print("=" * 80)
        print(f"Testing against: {BASE_URL}")
        print(f"Timeout: {TIMEOUT}s")
        print("-" * 80)
        
        # Run tests in logical order
        self.test_health_endpoint()
        self.test_signup_validation()
        test_email = self.test_signup_success()
        self.test_signin_validation()
        self.test_signin_success(test_email)
        self.test_auth_me_endpoint()
        
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