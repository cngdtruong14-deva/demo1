# Load Testing

Load and performance testing for QR Order Platform using Artillery.io.

## 📋 Setup

```bash
# Install Artillery
cd testing
npm install

# Or install globally
npm install -g artillery
```

## 🧪 Running Load Tests

### Basic load test
```bash
artillery run load-testing/scenarios.yml
```

### With custom target
```bash
artillery run --target http://staging.example.com load-testing/scenarios.yml
```

### Generate HTML report
```bash
artillery run --output report.json load-testing/scenarios.yml
artillery report report.json
```

### Quick test (10 seconds)
```bash
artillery quick --count 10 --num 5 http://localhost:5000/api/v1/health
```

## 📊 Test Scenarios

The `scenarios.yml` file includes:

1. **Menu Browsing** (40% weight) - Most common operation
2. **Menu with Filters** (20% weight) - Filtered menu requests
3. **Search Menu** (15% weight) - Search functionality
4. **Health Check** (10% weight) - System health monitoring
5. **Login Flow** (15% weight) - Authentication

## 🔧 Configuration

### Environment Variables

```bash
export TEST_BRANCH_ID=your-branch-uuid
export API_BASE_URL=http://localhost:5000/api/v1
```

### Customize Load Phases

Edit `scenarios.yml` to adjust:
- **Duration**: How long each phase runs
- **Arrival Rate**: Requests per second
- **Ramp Up**: Gradual increase in load

## 📈 Metrics

Artillery tracks:
- **Request rate**: Requests per second
- **Response times**: p50, p95, p99 latencies
- **Error rate**: Percentage of failed requests
- **Throughput**: Successful requests per second

## 🎯 Performance Targets

Based on system design:
- **p95 Response Time**: < 500ms
- **Error Rate**: < 1%
- **Throughput**: > 100 req/s

## 🚀 CI/CD Integration

```yaml
# GitHub Actions example
- name: Run Load Tests
  run: |
    cd testing
    npm install
    artillery run load-testing/scenarios.yml
```

## 📝 Custom Scenarios

Add new scenarios to `scenarios.yml`:

```yaml
scenarios:
  - name: "Custom Scenario"
    weight: 10
    flow:
      - get:
          url: "/api/v1/endpoint"
          expect:
            - statusCode: 200
```

## 🔍 Debugging

### Verbose output
```bash
artillery run --verbose load-testing/scenarios.yml
```

### Single scenario
```bash
artillery run --only "Browse Menu" load-testing/scenarios.yml
```

