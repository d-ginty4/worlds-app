package types

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
)

type Money struct {
	Currency string `json:"currency"`
	Value    string `json:"value"`
}

func (m *Money) String() string {
	j, _ := json.Marshal(m)
	str, _ := strconv.Unquote(strings.Replace(strconv.Quote(string(j)), `\\u`, `\u`, -1))

	return fmt.Sprintf("Money: %s", str)
}

type Address struct {
	FirstName   string  `json:"firstName"`
	LastName    string  `json:"lastName"`
	Address1    string  `json:"address1"`
	Address2    *string `json:"address2"`
	City        string  `json:"city"`
	State       string  `json:"state"`
	CountryCode string  `json:"countryCode"`
	PostalCode  string  `json:"postalCode"`
	Phone       string  `json:"phone"`
}

func (a *Address) String() string {
	j, _ := json.Marshal(a)
	str, _ := strconv.Unquote(strings.Replace(strconv.Quote(string(j)), `\\u`, `\u`, -1))

	return fmt.Sprintf("Address: %s", str)
}

type LineItem struct {
	ID            string `json:"id"`
	VariantID     string `json:"variantId"`
	SKU           string `json:"sku"`
	ProductID     string `json:"productId"`
	ProductName   string `json:"productName"`
	Quantity      int    `json:"quantity"`
	UnitPricePaid Money  `json:"unitPricePaid"`
	ImageURL      string `json:"imageUrl"`
	LineItemType  string `json:"lineItemType"`
}

func (l *LineItem) String() string {
	j, _ := json.Marshal(l)
	str, _ := strconv.Unquote(strings.Replace(strconv.Quote(string(j)), `\\u`, `\u`, -1))

	return fmt.Sprintf("Lineitem: %s", str)
}

type Order struct {
	ID                string     `json:"id"`
	OrderNumber       string     `json:"orderNumber"`
	CreatedOn         string     `json:"createdOn"`
	ModifiedOn        string     `json:"modifiedOn"`
	Channel           string     `json:"channel"`
	TestMode          bool       `json:"testmode"`
	CustomerEmail     string     `json:"customerEmail"`
	BillingAddress    *Address   `json:"billingAddress"`
	ShippingAddress   *Address   `json:"shippingAddress"`
	FulfillmentStatus string     `json:"fulfillmentStatus"`
	LineItems         []LineItem `json:"lineItems"`
	SubTotal          *Money     `json:"subTotal"`
	GrandTotal        *Money     `json:"grandTotal"`
	RefundedTotal     *Money     `json:"refundedTotal"`
}

func (o *Order) String() string {
	j, _ := json.Marshal(o)
	str, _ := strconv.Unquote(strings.Replace(strconv.Quote(string(j)), `\\u`, `\u`, -1))

	return fmt.Sprintf("Order: %s", str)
}

type Pagination struct {
	NextPageUrl    string `json:"nextPageUrl"`
	NextPageCursor string `json:"nextPageCursor"`
	HasNext        bool   `json:"hasNext"`
}

type Result struct {
	Result     []Order    `json:"result"`
	Pagination Pagination `json:"pagination"`
}
