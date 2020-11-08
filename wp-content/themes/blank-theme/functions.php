<?php
// Remove unnecessary elements from header
function setup_clean_header() {
  remove_action('wp_head', 'feed_links', 2);
  remove_action('wp_head', 'feed_links_extra', 3);
  remove_action('wp_head', 'print_emoji_detection_script', 7);
  remove_action('wp_print_styles', 'print_emoji_styles');
	remove_filter('the_content_feed', 'wp_staticize_emoji');
	remove_filter('comment_text_rss', 'wp_staticize_emoji');
  remove_action('wp_head', 'rest_output_link_wp_head', 10);
  remove_action ('wp_head', 'rsd_link');
  remove_action('wp_head', 'wlwmanifest_link');
}
add_action( 'init', 'setup_clean_header' );

// Remove Wordpress version
function setup_remove_version() {
  return '';
}
add_filter('the_generator', 'setup_remove_version');

//
function setup_remove_unnecessary_scripts() {
  wp_dequeue_script('starter-navigation');
  wp_deregister_script('starter-navigation');
}
add_action('wp_enqueue_scripts', 'setup_remove_unnecessary_scripts', 20);

//
function setup_remove_unnecessary_styles() {
  wp_dequeue_style('wp-block-library');
  wp_deregister_style('wp-block-library');

  wp_dequeue_style('starter-style');
  wp_deregister_style('starter-style');
}
add_action('wp_enqueue_scripts', 'setup_remove_unnecessary_styles', 20);

//
function setup_register_styles() {
  $theme_version = wp_get_theme()->get( 'Version' );
  wp_enqueue_style('main-styles', get_stylesheet_directory_uri() . '/dist/css/styles.css', array(), $theme_version );
}
add_action('wp_enqueue_scripts', 'setup_register_styles', 20);

  
