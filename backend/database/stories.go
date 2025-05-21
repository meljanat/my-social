package database

import structs "social-network/data"

func CreateStory(story structs.Story) error {
	_, err := DB.Exec("INSERT INTO stories (user_id, image) VALUES (?, ?)", story.User.ID, story.Image)
	return err
}

func GetStories(user structs.User, following []structs.User) ([][]structs.Story, error) {
	var stories [][]structs.Story
	following = append(following, user)
	for _, usr := range following {
		var stories_user []structs.Story
		rows, err := DB.Query("SELECT s.id, s.user_id, s.image, ss.read FROM stories s JOIN stories_status ss ON s.id == ss.story_id WHERE s.user_id = ?", usr.ID)
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		for rows.Next() {
			var story structs.Story
			if err := rows.Scan(&story.ID, &story.User.ID, &story.Image, &story.IsRead); err != nil {
				return nil, err
			}
			story.User = usr
			stories_user = append(stories_user, story)
		}
		stories = append(stories, stories_user)
	}
	return stories, nil
}
