#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Kairo AI Platform
Testing all API endpoints including authentication, god-tier features, and core functionality
"""

import requests
import json
import time
import sys
from typing import Dict, Any, List, Tuple

# Configuration
BASE_URL = "http://localhost:3001"
TIMEOUT = 30

class KairoAPITester:
    def __init__(self):
        self.results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.session = requests.Session()  # Use session to handle cookies
        self.demo_user_id = None
        self.is_authenticated = False
        
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
    
    def make_request(self, method: str, endpoint: str, payload: Dict[Any, Any] = None, headers: Dict[str, str] = None) -> Tuple[bool, str, float, Any]:
        """Make HTTP request with error handling using session for cookies"""
        url = f"{BASE_URL}/api/{endpoint}"
        
        # Default headers
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)
        
        try:
            start_time = time.time()
            
            if method == 'GET':
                response = self.session.get(url, headers=default_headers, timeout=TIMEOUT)
            elif method == 'POST':
                response = self.session.post(url, json=payload, headers=default_headers, timeout=TIMEOUT)
            elif method == 'PUT':
                response = self.session.put(url, json=payload, headers=default_headers, timeout=TIMEOUT)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=default_headers, timeout=TIMEOUT)
            else:
                return False, f"Unsupported method: {method}", 0, None
            
            response_time = time.time() - start_time
            
            # Try to parse JSON response
            try:
                data = response.json()
            except json.JSONDecodeError:
                data = {"raw_response": response.text}
            
            # Check HTTP status code
            if response.status_code not in [200, 201]:
                return False, f"HTTP {response.status_code}: {response.text[:200]}", response_time, data
            
            return True, f"Success - Status: {response.status_code}", response_time, data
            
        except requests.exceptions.Timeout:
            return False, f"Request timeout after {TIMEOUT}s", TIMEOUT, None
        except requests.exceptions.ConnectionError:
            return False, "Connection error - server may be down", 0, None
        except Exception as e:
            return False, f"Unexpected error: {str(e)}", 0, None
    
    def test_health_check(self):
        """Test health check endpoint"""
        success, details, response_time, data = self.make_request('GET', 'health')
        self.log_result('GET /api/health', 'PASS' if success else 'FAIL', response_time, details)
        return success
    
    def test_demo_account_login(self):
        """Test demo account login"""
        payload = {
            "email": "demo.user.2025@kairo.test",
            "password": "DemoAccess2025!"
        }
        
        success, details, response_time, data = self.make_request('POST', 'auth/signin', payload)
        
        if success and data and 'user' in data:
            self.is_authenticated = True
            if 'id' in data['user']:
                self.demo_user_id = data['user']['id']
            details += f" - Authenticated, User ID: {self.demo_user_id}"
        
        self.log_result('POST /api/auth/signin (Demo Account)', 'PASS' if success else 'FAIL', response_time, details)
        return success
    
    def test_auth_me(self):
        """Test current user endpoint"""
        if not self.is_authenticated:
            self.log_result('GET /api/auth/me', 'SKIP', 0, 'Not authenticated')
            return False
        
        success, details, response_time, data = self.make_request('GET', 'auth/me')
        self.log_result('GET /api/auth/me', 'PASS' if success else 'FAIL', response_time, details)
        return success
    
    def test_user_profile(self):
        """Test user profile endpoint"""
        if not self.is_authenticated:
            self.log_result('GET /api/user/profile', 'SKIP', 0, 'Not authenticated')
            return False
        
        success, details, response_time, data = self.make_request('GET', 'user/profile')
        self.log_result('GET /api/user/profile', 'PASS' if success else 'FAIL', response_time, details)
        return success
    
    def test_user_activity(self):
        """Test user activity endpoint"""
        if not self.is_authenticated:
            self.log_result('GET /api/user/activity', 'SKIP', 0, 'Not authenticated')
            return False
        
        success, details, response_time, data = self.make_request('GET', 'user/activity')
        self.log_result('GET /api/user/activity', 'PASS' if success else 'FAIL', response_time, details)
        return success
    
    def test_performance_metrics(self):
        """Test performance metrics endpoint"""
        success, details, response_time, data = self.make_request('GET', 'performance/metrics')
        self.log_result('GET /api/performance/metrics', 'PASS' if success else 'FAIL', response_time, details)
        return success
    
    def test_performance_cache_status(self):
        """Test performance cache status endpoint"""
        success, details, response_time, data = self.make_request('GET', 'performance/cache-status')
        self.log_result('GET /api/performance/cache-status', 'PASS' if success else 'FAIL', response_time, details)
        return success
    
    def test_notifications(self):
        """Test notifications endpoint"""
        if not self.is_authenticated:
            self.log_result('GET /api/notifications', 'SKIP', 0, 'Not authenticated')
            return False
        
        success, details, response_time, data = self.make_request('GET', 'notifications')
        self.log_result('GET /api/notifications', 'PASS' if success else 'FAIL', response_time, details)
        return success
    
    def test_learning_progress(self):
        """Test learning progress endpoint"""
        if not self.is_authenticated:
            self.log_result('GET /api/learning/progress', 'SKIP', 0, 'Not authenticated')
            return False
        
        success, details, response_time, data = self.make_request('GET', 'learning/progress')
        self.log_result('GET /api/learning/progress', 'PASS' if success else 'FAIL', response_time, details)
        return success
    
    def test_integrations_test(self):
        """Test integrations test endpoint"""
        payload = {
            "integration": "test",
            "action": "validate_connection"
        }
        
        success, details, response_time, data = self.make_request('POST', 'integrations/test', payload)
        self.log_result('POST /api/integrations/test', 'PASS' if success else 'FAIL', response_time, details)
        return success
    
    def test_demo_test(self):
        """Test demo test endpoint"""
        success, details, response_time, data = self.make_request('GET', 'demo/test')
        self.log_result('GET /api/demo/test', 'PASS' if success else 'FAIL', response_time, details)
        return success
    
    # God-tier endpoints testing
    def test_quantum_simulation(self):
        """Test Quantum Simulation Engine"""
        payload = {
            "workflowData": {
                "id": "workflow_quantum_test_001",
                "name": "Advanced Quantum Workflow",
                "nodes": [
                    {"id": "node_1", "type": "data_processor", "category": "quantum"},
                    {"id": "node_2", "type": "ml_predictor", "category": "ai"},
                    {"id": "node_3", "type": "result_aggregator", "category": "output"}
                ]
            },
            "simulationParams": {
                "accuracy_target": 99.1,
                "quantum_coherence_required": True,
                "timeline_analysis": True
            }
        }
        
        success, details, response_time, data = self.make_request('POST', 'quantum-simulation', payload)
        self.log_result('POST /api/quantum-simulation', 'PASS' if success else 'FAIL', response_time, details)
        return success
    
    def test_hipaa_compliance(self):
        """Test HIPAA Compliance Pack"""
        payload = {
            "workflowData": {
                "id": "healthcare_workflow_001",
                "name": "Patient Data Processing Workflow",
                "nodes": [
                    {"id": "phi_collector", "type": "data_input", "category": "healthcare", "config": {"contains_phi": True}},
                    {"id": "phi_processor", "type": "data_transform", "category": "healthcare"},
                    {"id": "audit_logger", "type": "compliance", "category": "security"}
                ]
            },
            "complianceLevel": "full"
        }
        
        success, details, response_time, data = self.make_request('POST', 'hipaa-compliance', payload)
        self.log_result('POST /api/hipaa-compliance', 'PASS' if success else 'FAIL', response_time, details)
        return success
    
    def test_reality_fabricator(self):
        """Test Reality Fabricator API"""
        payload = {
            "action": "optimize_smart_building_climate",
            "deviceId": "building_hvac_system_001",
            "parameters": {
                "deviceType": "smart_hvac",
                "location": "Corporate Headquarters Floor 15",
                "scope": "building_wide",
                "target_temperature": 72,
                "energy_efficiency_mode": True
            }
        }
        
        success, details, response_time, data = self.make_request('POST', 'reality-fabricator', payload)
        self.log_result('POST /api/reality-fabricator', 'PASS' if success else 'FAIL', response_time, details)
        return success
    
    def test_auto_compliance(self):
        """Test Auto-Compliance Generator"""
        payload = {
            "regulationText": "All financial transactions must maintain audit trails for 7 years with immutable storage and real-time monitoring capabilities",
            "industry": "financial_services",
            "jurisdiction": "US"
        }
        
        success, details, response_time, data = self.make_request('POST', 'auto-compliance', payload)
        self.log_result('POST /api/auto-compliance', 'PASS' if success else 'FAIL', response_time, details)
        return success
    
    def test_global_consciousness(self):
        """Test Global Consciousness Feed"""
        payload = {
            "feedType": "real_time_global_intelligence",
            "dataFilters": {
                "geographic_scope": "worldwide",
                "data_categories": ["iot_sensors", "social_signals", "economic_indicators"],
                "intelligence_level": "collective_wisdom"
            },
            "aggregationLevel": "global_synthesis"
        }
        
        success, details, response_time, data = self.make_request('POST', 'global-consciousness', payload)
        self.log_result('POST /api/global-consciousness', 'PASS' if success else 'FAIL', response_time, details)
        return success
    
    def test_trinity_endpoints(self):
        """Test Trinity API endpoints"""
        # Test miracles endpoint
        payload = {"miracle_type": "workflow_optimization", "intensity": "divine"}
        success, details, response_time, data = self.make_request('POST', 'trinity/miracles', payload)
        self.log_result('POST /api/trinity/miracles', 'PASS' if success else 'FAIL', response_time, details)
        
        # Test prophecy endpoint
        payload = {"prophecy_request": "future_automation_trends", "timeline": "next_quarter"}
        success, details, response_time, data = self.make_request('POST', 'trinity/prophecy', payload)
        self.log_result('POST /api/trinity/prophecy', 'PASS' if success else 'FAIL', response_time, details)
        
        # Test temporal throne endpoint
        payload = {"temporal_action": "timeline_analysis", "scope": "enterprise_wide"}
        success, details, response_time, data = self.make_request('POST', 'trinity/temporal-throne', payload)
        self.log_result('POST /api/trinity/temporal-throne', 'PASS' if success else 'FAIL', response_time, details)
    
    def test_god_tier_dashboard(self):
        """Test God-tier dashboard endpoint"""
        if not self.auth_token:
            self.log_result('GET /api/god-tier/dashboard', 'SKIP', 0, 'No auth token available')
            return False
        
        success, details, response_time, data = self.make_request('GET', 'god-tier/dashboard')
        self.log_result('GET /api/god-tier/dashboard', 'PASS' if success else 'FAIL', response_time, details)
        return success
    
    def run_all_tests(self):
        """Run comprehensive API test suite"""
        print("=" * 80)
        print("KAIRO AI PLATFORM - COMPREHENSIVE API TESTING")
        print("=" * 80)
        print(f"Testing against: {BASE_URL}")
        print(f"Timeout: {TIMEOUT}s")
        print("-" * 80)
        
        # Core system tests
        print("\n🔧 CORE SYSTEM TESTS")
        print("-" * 40)
        self.test_health_check()
        self.test_demo_test()
        
        # Authentication tests
        print("\n🔐 AUTHENTICATION TESTS")
        print("-" * 40)
        self.test_demo_account_login()
        self.test_auth_me()
        
        # User management tests
        print("\n👤 USER MANAGEMENT TESTS")
        print("-" * 40)
        self.test_user_profile()
        self.test_user_activity()
        self.test_notifications()
        self.test_learning_progress()
        
        # Performance tests
        print("\n⚡ PERFORMANCE TESTS")
        print("-" * 40)
        self.test_performance_metrics()
        self.test_performance_cache_status()
        
        # Integration tests
        print("\n🔗 INTEGRATION TESTS")
        print("-" * 40)
        self.test_integrations_test()
        
        # God-tier feature tests
        print("\n🚀 GOD-TIER FEATURE TESTS")
        print("-" * 40)
        self.test_quantum_simulation()
        self.test_hipaa_compliance()
        self.test_reality_fabricator()
        self.test_auto_compliance()
        self.test_global_consciousness()
        self.test_god_tier_dashboard()
        
        # Trinity tests
        print("\n✨ TRINITY TESTS")
        print("-" * 40)
        self.test_trinity_endpoints()
        
        # Print comprehensive summary
        print("\n" + "=" * 80)
        print("COMPREHENSIVE TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.failed_tests}")
        print(f"Success Rate: {(self.passed_tests/self.total_tests*100):.1f}%")
        
        # Categorize results
        auth_tests = [r for r in self.results if 'auth' in r['endpoint']]
        god_tier_tests = [r for r in self.results if any(x in r['endpoint'] for x in ['quantum', 'hipaa', 'reality', 'consciousness', 'god-tier'])]
        performance_tests = [r for r in self.results if 'performance' in r['endpoint']]
        
        print(f"\nAuthentication Tests: {len([r for r in auth_tests if r['status'] == 'PASS'])}/{len(auth_tests)} passed")
        print(f"God-tier Tests: {len([r for r in god_tier_tests if r['status'] == 'PASS'])}/{len(god_tier_tests)} passed")
        print(f"Performance Tests: {len([r for r in performance_tests if r['status'] == 'PASS'])}/{len(performance_tests)} passed")
        
        if self.failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.results:
                if result['status'] == 'FAIL':
                    print(f"  - {result['endpoint']}: {result['details']}")
        
        print("\n📊 PERFORMANCE METRICS:")
        response_times = [r['response_time_ms'] for r in self.results if r['status'] == 'PASS']
        if response_times:
            print(f"  Average Response Time: {sum(response_times)/len(response_times):.2f}ms")
            print(f"  Fastest Response: {min(response_times):.2f}ms")
            print(f"  Slowest Response: {max(response_times):.2f}ms")
        
        # Authentication status
        print(f"\n🔑 AUTHENTICATION STATUS:")
        print(f"  Demo Account Login: {'✅ Success' if self.auth_token else '❌ Failed'}")
        print(f"  Auth Token: {'✅ Available' if self.auth_token else '❌ Not Available'}")
        print(f"  User ID: {self.demo_user_id if self.demo_user_id else '❌ Not Available'}")
        
        print("=" * 80)
        
        # Return success status
        return self.failed_tests == 0

if __name__ == "__main__":
    tester = KairoAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)