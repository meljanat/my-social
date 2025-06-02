package database

import (
	structs "social-network/data"
)

func CreateCategories() error {
	if cat := CheckCategories(); cat == nil {
		categories := []string{
			"Sport", "General", "Tech", "Gaming", "Movies", "Music",
			"Health", "Travel", "Food", "Fashion", "Education",
			"Science", "Art", "Finance", "Lifestyle", "History",
		}
		colors := []string{
			"#FF5733", "#33C3FF", "#8E44AD", "#E74C3C", "#F39C12", "#1ABC9C",
			"#2ECC71", "#3498DB", "#E67E22", "#9B59B6", "#34495E", "#16A085",
			"#D35400", "#C0392B", "#7F8C8D", "#BDC3C7",
		}

		backgrounds := []string{
			"#FFE5E0", "#E0F7FF", "#F3E5F5", "#FFE0E0", "#FFF3E0", "#E0FFF5",
			"#E0FFE0", "#E0EFFF", "#FFF0E0", "#F5E0FF", "#E0E0F5", "#E0FFF0",
			"#FFEDE0", "#FFE0E0", "#F0F0F0", "#F5F5F5",
		}
		for i, category := range categories {
			_, err := DB.Exec("INSERT INTO categories (name, color, background) VALUES (?, ?, ?)", category, colors[i], backgrounds[i])
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func CheckCategories() *structs.Category {
	var cat structs.Category
	err := DB.QueryRow("SELECT * FROM categories").Scan(&cat.ID, &cat.Name, &cat.Color, &cat.Background)
	if err != nil {
		return nil
	}
	return &cat
}

func GetCategories() ([]structs.Category, error) {
	rows, err := DB.Query("SELECT id, name FROM categories")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var categories []structs.Category
	for rows.Next() {
		var category structs.Category
		if err := rows.Scan(&category.ID, &category.Name); err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}
	return categories, nil
}

func GetBestCategories() ([]structs.Category, error) {
	rows, err := DB.Query("SELECT c.id, c.name, COUNT(*) FROM categories c LEFT JOIN posts p ON p.category_id = c.id GROUP BY c.id ORDER BY COUNT(*) DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var categories []structs.Category
	for rows.Next() {
		var category structs.Category
		if err := rows.Scan(&category.ID, &category.Name, &category.Count); err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}
	return categories, nil
}

func GetCategoryById(id int64) (*structs.Category, error) {
	var category structs.Category
	err := DB.QueryRow("SELECT id, name, color, background FROM categories WHERE id = ?", id).Scan(&category.ID, &category.Name, &category.Color, &category.Background)
	return &category, err
}
