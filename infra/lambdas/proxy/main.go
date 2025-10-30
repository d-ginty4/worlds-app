package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"io"
	"net/http"
	"os"
	"proxy/types"
	"time"
)

func makeRequest(url string) (string, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %s", err)
	}

	apiKey := os.Getenv("SQUARESPACE_KEY")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to make request: %s", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("error reading body: %s", err)
	}

	return string(body), nil
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// CORS headers for ALL responses
	corsHeaders := map[string]string{
		"Access-Control-Allow-Origin":  "https://d-ginty4.github.io",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
		"Access-Control-Allow-Methods": "GET, OPTIONS",
		"Content-Type":                 "application/json",
	}

	url := request.QueryStringParameters["url"]

	resp, err := makeRequest(url)
	if err != nil {
		panic(err)
	}

	var result types.Result
	if err := json.Unmarshal([]byte(resp), &result); err == nil {
		newResult := types.Result{
			Pagination: result.Pagination,
			Result:     []types.Order{},
		}
		for _, order := range result.Result {
			newOrder := types.Order{
				ID:              order.ID,
				OrderNumber:     order.OrderNumber,
				GrandTotal:      order.GrandTotal,
				SubTotal:        order.SubTotal,
				LineItems:       order.LineItems,
				RefundedTotal:   order.RefundedTotal,
				BillingAddress:  nil,
				ShippingAddress: nil,
				CustomerEmail:   "",
			}

			newResult.Result = append(newResult.Result, newOrder)
		}

		out, _ := json.Marshal(newResult)
		return events.APIGatewayProxyResponse{
			StatusCode: 200,
			Headers:    corsHeaders,
			Body:       string(out),
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 500,
		Headers:    corsHeaders,
		Body:       "Unable to make request",
	}, nil
}

func main() {
	lambda.Start(handler)
}
