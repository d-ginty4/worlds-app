package types

type Money struct {
	Currency string `json:"currency"`
	Value    string `json:"value"`
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
	GrandTotal        Money      `json:"grandTotal"`
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
