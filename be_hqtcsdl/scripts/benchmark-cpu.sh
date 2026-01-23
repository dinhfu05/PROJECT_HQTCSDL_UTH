#!/bin/bash

##############################################################################
# Performance Load Testing Script
# Purpose: Generate load to visualize CPU/Memory impact
##############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

##############################################################################
# Configuration
##############################################################################

API_HOST="http://localhost:3000"
CONCURRENT=50  # Concurrent requests
REQUESTS=1000  # Total requests

##############################################################################
# Functions
##############################################################################

print_header() {
    echo -e "${BLUE}"
    echo "════════════════════════════════════════════════════════════"
    echo "  $1"
    echo "════════════════════════════════════════════════════════════"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

##############################################################################
# SQL Load Test (in MySQL)
##############################################################################

sql_load_test() {
    local iterations=$1
    local test_type=$2
    
    print_header "SQL LOAD TEST: $test_type ($iterations iterations)"
    
    docker exec -i hqtcsdl-mysql mysql -u root -proot123 hqtcsdl <<EOF
-- Run query multiple times to generate load
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS load_test()
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE start_time DATETIME;
    DECLARE end_time DATETIME;
    DECLARE elapsed DECIMAL(10,3);
    
    SET start_time = NOW(3);
    
    WHILE i < $iterations DO
        -- Query 1: Category filtering
        SELECT COUNT(*) INTO @dummy 
        FROM products 
        WHERE category_id = (i % 20) + 1 
        ORDER BY created_at DESC 
        LIMIT 20;
        
        SET i = i + 1;
    END WHILE;
    
    SET end_time = NOW(3);
    SET elapsed = TIMESTAMPDIFF(MICROSECOND, start_time, end_time) / 1000;
    
    SELECT 
        '$test_type' as test_name,
        $iterations as total_queries,
        ROUND(elapsed, 2) as total_time_ms,
        ROUND(elapsed / $iterations, 2) as avg_time_ms;
END//
DELIMITER ;

CALL load_test();
DROP PROCEDURE load_test;
EOF
}

##############################################################################
# Monitor CPU during test
##############################################################################

monitor_cpu() {
    print_header "REAL-TIME CPU MONITORING"
    echo -e "${YELLOW}Press Ctrl+C to stop monitoring${NC}\n"
    
    # Use docker stats with custom format
    docker stats hqtcsdl-mysql --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
}

##############################################################################
# Benchmark: Without Indexes
##############################################################################

benchmark_no_indexes() {
    print_header "BENCHMARK: WITHOUT INDEXES"
    
    # Drop indexes
    print_warning "Dropping indexes..."
    docker exec -i hqtcsdl-mysql mysql -u root -proot123 hqtcsdl < scripts/indexes/drop-products.sql 2>/dev/null || true
    
    print_success "Indexes dropped"
    
    # Run load test
    sql_load_test 100 "WITHOUT INDEXES"
}

##############################################################################
# Benchmark: With Indexes
##############################################################################

benchmark_with_indexes() {
    print_header "BENCHMARK: WITH INDEXES"
    
    # Create indexes
    print_warning "Creating indexes..."
    docker exec -i hqtcsdl-mysql mysql -u root -proot123 hqtcsdl < scripts/create-indexes.sql 2>/dev/null
    
    print_success "Indexes created"
    
    # Analyze table
    docker exec -i hqtcsdl-mysql mysql -u root -proot123 hqtcsdl -e "ANALYZE TABLE products;" > /dev/null
    
    # Run load test
    sql_load_test 100 "WITH INDEXES"
}

##############################################################################
# Main Menu
##############################################################################

show_menu() {
    clear
    print_header "PERFORMANCE DEMO - CPU MONITORING"
    
    echo "Choose test scenario:"
    echo
    echo "  1) Monitor CPU (real-time)"
    echo "  2) Benchmark WITHOUT indexes (100 queries)"
    echo "  3) Benchmark WITH indexes (100 queries)"
    echo "  4) Compare: No Index vs Index"
    echo "  5) Heavy Load Test (1000 queries)"
    echo "  0) Exit"
    echo
    read -p "Select option: " choice
    
    case $choice in
        1)
            monitor_cpu
            ;;
        2)
            benchmark_no_indexes
            read -p "Press Enter to continue..."
            show_menu
            ;;
        3)
            benchmark_with_indexes
            read -p "Press Enter to continue..."
            show_menu
            ;;
        4)
            benchmark_no_indexes
            echo
            benchmark_with_indexes
            read -p "Press Enter to continue..."
            show_menu
            ;;
        5)
            print_header "HEAVY LOAD TEST"
            echo "This will run 1000 queries. Monitor CPU in another terminal:"
            echo "  docker stats hqtcsdl-mysql"
            echo
            read -p "Press Enter to start..."
            sql_load_test 1000 "HEAVY LOAD"
            read -p "Press Enter to continue..."
            show_menu
            ;;
        0)
            print_success "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid option"
            sleep 1
            show_menu
            ;;
    esac
}

##############################################################################
# Entry Point
##############################################################################

if [ $# -eq 0 ]; then
    show_menu
else
    case $1 in
        monitor)
            monitor_cpu
            ;;
        no-index)
            benchmark_no_indexes
            ;;
        with-index)
            benchmark_with_indexes
            ;;
        compare)
            benchmark_no_indexes
            echo
            benchmark_with_indexes
            ;;
        *)
            echo "Usage: $0 [monitor|no-index|with-index|compare]"
            exit 1
            ;;
    esac
fi
