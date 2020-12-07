package main

import (
	"errors"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

var whiteList = map[string]interface{}{}

// handler is the lambda handler invoked by the `lambda.Start` function call
func handler(event events.CognitoEventUserPoolsPreSignup) (events.CognitoEventUserPoolsPreSignup, error) {
	if _, ok := whiteList[event.Request.UserAttributes["email"]]; !ok {
		return event, errors.New("Forbidden")
	}
	return event, nil
}

func init() {
	for _, email := range strings.Split(os.Getenv("ALLOW_EMAILS"), ",") {
		whiteList[email] = struct{}{}
	}
}

func main() {
	lambda.Start(handler)
}
