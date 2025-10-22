-- Create categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#000000',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create images table
CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  alt_text TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  cloudinary_url TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_images_category ON images(category);
CREATE INDEX idx_images_created_at ON images(created_at DESC);
CREATE INDEX idx_images_alt_text ON images USING gin(to_tsvector('english', alt_text));

-- Insert initial categories
INSERT INTO categories (name, description, color) VALUES
('Portraits', 'Individual and group portraits', '#8B5CF6'),
('Lifestyle', 'Candid lifestyle photography', '#06B6D4'),
('Artistic', 'Creative and artistic shots', '#F59E0B'),
('Prints', 'Digital prints and macro photography', '#10B981');

-- Insert sample images (replace with your actual data)
INSERT INTO images (filename, alt_text, category, cloudinary_url, width, height, file_size) VALUES
('portrait-black-dress.jpg', 'Portrait in black dress against textured wall', 'Portraits', 'https://res.cloudinary.com/your-cloud/image/upload/v1/portrait-black-dress', 1200, 800, 250000),
('tying-shoes.jpg', 'Artistic portrait tying shoes', 'Portraits', 'https://res.cloudinary.com/your-cloud/image/upload/v1/tying-shoes', 1200, 800, 200000),
('duo-sitting.jpg', 'Duo portrait sitting together', 'Portraits', 'https://res.cloudinary.com/your-cloud/image/upload/v1/duo-sitting', 1200, 800, 300000),
('stairs-outdoor.jpg', 'Outdoor portrait on stairs', 'Portraits', 'https://res.cloudinary.com/your-cloud/image/upload/v1/stairs-outdoor', 1200, 800, 280000),
('garden-bench.jpeg', 'Garden portrait on bench with roses', 'Portraits', 'https://res.cloudinary.com/your-cloud/image/upload/v1/garden-bench', 1200, 800, 320000),
('balcony-night.jpg', 'Night portrait on balcony', 'Artistic', 'https://res.cloudinary.com/your-cloud/image/upload/v1/balcony-night', 1200, 800, 350000),
('green-berries.jpg', 'Macro shot of green berries with water droplets', 'Prints', 'https://res.cloudinary.com/your-cloud/image/upload/v1/green-berries', 1200, 800, 180000),
('autumn-path.jpeg', 'Autumn path with vibrant fall foliage', 'Prints', 'https://res.cloudinary.com/your-cloud/image/upload/v1/autumn-path', 1200, 800, 220000),
('white-flowers.jpeg', 'Delicate white flowers macro', 'Prints', 'https://res.cloudinary.com/your-cloud/image/upload/v1/white-flowers', 1200, 800, 190000),
('wood-texture.jpeg', 'Abstract wood texture with golden tones', 'Prints', 'https://res.cloudinary.com/your-cloud/image/upload/v1/wood-texture', 1200, 800, 210000),
('succulent.jpg', 'Succulent plant with water droplets', 'Prints', 'https://res.cloudinary.com/your-cloud/image/upload/v1/succulent', 1200, 800, 170000),
('makeup-brush.jpeg', 'Artistic makeup brush close-up', 'Prints', 'https://res.cloudinary.com/your-cloud/image/upload/v1/makeup-brush', 1200, 800, 160000),
('eggshells.jpeg', 'Black and white cracked eggshells', 'Prints', 'https://res.cloudinary.com/your-cloud/image/upload/v1/eggshells', 1200, 800, 200000),
('flower-petals.jpeg', 'Flower petals with water droplets', 'Prints', 'https://res.cloudinary.com/your-cloud/image/upload/v1/flower-petals', 1200, 800, 180000);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
