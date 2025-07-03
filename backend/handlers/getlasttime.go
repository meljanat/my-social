package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"social-network/database"
)

func LastTime(w http.ResponseWriter, r *http.Request, name_table string) bool {
	timelast, err := database.GetLastTime(name_table)
	if err != nil && err.Error() == "sql: no rows in result set" {
		return true
	} else if err != nil {
		fmt.Println("Error fetching last post time:", err)
		response := map[string]string{"error": "Failed to fetch last post time"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return false
	}
	layout := "2006-01-02T15:04:05Z"
	time_exact, err := time.Parse(layout, timelast)
	if err != nil {
		fmt.Println("Error parsing time:", err)
		response := map[string]string{"error": "Failed to parse time"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return false
	}
	time := time.Now()
	if time.UnixMilli()-time_exact.UnixMilli() <= 100 {
		fmt.Println("Post too soon")
		response := map[string]string{"error": "Post too soon"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return false
	}
	return true
}
