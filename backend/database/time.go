package database

import (
	"fmt"
	"time"
)

func TimeAgo(date time.Time) string {
	timeAgo := time.Since(date)
	if timeAgo.Minutes() < 1 {
		return "Just now"
	} else if timeAgo.Minutes() < 2 {
		return fmt.Sprintf("%d minute ago", int(timeAgo.Minutes()))
	} else if timeAgo.Minutes() < 60 {
		return fmt.Sprintf("%d minutes ago", int(timeAgo.Minutes()))
	} else if timeAgo.Minutes() < 60*2 {
		return fmt.Sprintf("%d hour ago", int(timeAgo.Hours()))
	} else if timeAgo.Minutes() < 60*24 {
		return fmt.Sprintf("%d hours ago", int(timeAgo.Hours()))
	} else if timeAgo.Minutes() < 60*24*2 {
		return fmt.Sprintf("%d day ago", int(timeAgo.Hours())/24)
	}
	return fmt.Sprintf("%d days ago", int(timeAgo.Hours())/24)
}
