# Use official PHP image with Apache
FROM php:8.2-apache

# Set working directory
WORKDIR /var/www/html

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    mysqli \
    json \
    curl

# Enable Apache mod_rewrite for routing
RUN a2enmod rewrite

# Copy application files
COPY . /var/www/html/

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html

# Create cache directory for predictions
RUN mkdir -p /var/www/html/cache && chown -R www-data:www-data /var/www/html/cache

# Configure Apache VirtualHost
RUN echo '<VirtualHost *:80>\
    DocumentRoot /var/www/html\
    <Directory /var/www/html>\
        AllowOverride All\
        Require all granted\
    </Directory>\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

# Expose port 80
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
