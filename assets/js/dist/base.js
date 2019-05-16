var content_type = $('form').data('content_type');
var base_field = $('form').data('base_field');

// returns the year and month for use in the filepath on GitHub
// Returns: 2017/09
function file_yearmo() {
  var dateInput = $("#block-date input").val().match(/^[^\s]+/);
  var dateObj = new Date(dateInput);
  var year = dateObj.getUTCFullYear();
  var month = ("0" + (dateObj.getUTCMonth() + 1)).slice(-2); //months from 1-12
  var yearmo = year + "/" + month + "/";

  return yearmo;
}

function update_matter(){
  var post_matter = "";
  var page_url_comment = get_page_url_comment(content_type);
  var branch = "demo";
  post_matter += "---";
  post_matter += page_url_comment;
  post_matter += "\n# Learn how to edit our pages at https://workflow.digital.gov\n";
  $('*[data-block]').each(function(){
		var id = $(this).data('block'); // gets the id
		var data_type = $(this).data('block-data_type'); // gets the data_type
		var comment = $(this).data('block-comment') !== "" ? '\n# ' + $(this).data('block-comment') + '\n' : ""; // gets the comment

    // Process the text
    var val = process_text(id, $(this));

    // checks if the data should 'skip' and not appear in the front matter
    if (val !== "skip") {
      if ((data_type == "string")) {
        var front_matter = '\n'+ comment + id + ': "' + val + '"';
      } else {
        var front_matter = '\n'+ comment+ id + ': ' + val;
      }
      post_matter += front_matter;
    }

	});
  post_matter += "\n\n# ♥♥♥ Make it better ♥♥♥\n";
  post_matter += "---";

  $("#post-matter").html(post_matter);
  $("#newfile").attr('href', get_github_url(post_matter));
}


function process_text(id, el){
  if (id == base_field) {
    return el.val();
  } else if (id == 'authors') {
    return cs2ds(el.select2('data'));
  } else if (id == 'topics'){
    return cs2ds(el.select2('data'));
  } else if (id == 'source') {
    if ($('#block-'+id).hasClass('display-none') == true) {
      return 'skip';
    } else {
      return el.val();
    }
  } else if (id == 'source_url') {
    if ($('#block-'+id).hasClass('display-none') == true) {
      return 'skip';
    } else {
      return el.val();
    }
  } else if (id == 'branch') {
    return 'skip';
  } else if (id == 'date') {
    var time = $('#block-time input').val();
    return el.val() + ' ' + time;
  } else if (id == 'date-end') {
    var time = $('#block-time-end input').val();
    return el.val() + ' ' + time;
  } else if (id == 'time') {
    return 'skip';
  } else if (id == 'time-end') {
    return 'skip';
  } else if (id == 'slug') {
    var slug = slugify();
    $(el).val(slug);
    return slug;
  } else if (id == 'uid') {
    var uid = slugify();
    $(el).val(uid);
    return uid;
  } else if (id == 'filename') {
    var slug = slugify();
    var filename = slug + '.md';
    $('#filename').text(filename);
    return 'skip';
  } else if (id == 'filename-dated') {
    var slug = slugify();
    var date = $('#block-date input').val();
    var filename = date + '-' + slug + '.md';
    $('#filename').text(filename);
    return 'skip';
  } else if (id == 'venue') {
    return 'skip';
  } else if (id == 'venue_name' || id == 'room' || id == 'address' || id == 'city' || id == 'state' || id == 'country' || id == 'zip' || id == 'map') {
    return get_venue_info(id, el);
  } else {
    return el.val();
  }
}

function cs2ds(tax) {
  var output = "\n";
  $.each( tax, function( i, e ) {
    if (i === tax.length - 1) {
      output += "  - " + $.trim(e.id);
    } else {
      output += "  - " + $.trim(e.id) + "\n";
    }
  });
  return output;
}

function get_filename(){
  return $('#filename').text();
}

function get_edit_branch(){
  return "demo";
}

function get_page_url_comment(content_type){
  var url = get_publish_url(content_type);
  var comment = "\n# View this page at " + url;
  return comment;
}

function get_publish_url(content_type) {
  var slug = slugify();
  if (content_type == 'posts') {
    var url = "https://digital.gov/" + file_yearmo() + slug;
  } else if (content_type == 'events') {
    var url = "https://digital.gov/event/" + file_yearmo() + slug;
  } else if (content_type == 'resources') {
    var url = "https://digital.gov/resources/" + slug;
  } else if (content_type == 'services') {
    var url = "https://digital.gov/services/" + slug;
  } else if (content_type == 'communities') {
    var url = "https://digital.gov/communities/" + slug;
  } else if (content_type == 'authors') {
    var url = "https://digital.gov/authors/" + slug;
  } else {
    var url = "https://digital.gov/" + file_yearmo() + slug;
  }
  return url;
}


function get_github_url(post_matter) {
  var base_url = "https://github.com/GSA/digitalgov.gov/new/"+get_edit_branch()+"/content/"+content_type+"/";
  var commit_msg = "New "+ content_type +": " + ($('#block-'+base_field +' input').val()).trim();
  var commit_desc = "";
  if ($("#block-deck textarea").length) {
    var commit_desc = ($("#block-deck textarea").val()).trim();
  }

  if (content_type == 'posts' || content_type == 'events') {
    base_url += file_yearmo() + 'draft?filename=' + get_filename() + '&value=' + encodeURIComponent(post_matter) + '&message=' + encodeURIComponent(commit_msg) + '&description=' + encodeURIComponent(commit_desc) + '&target_branch=' + get_edit_branch();
  } else if (content_type == 'authors' || content_type == 'topics') {
    base_url += slugify() + '/draft?filename=_index.md' + '&value=' + encodeURIComponent(post_matter) + '&message=' + encodeURIComponent(commit_msg) + '&description=' + encodeURIComponent(commit_desc) + '&target_branch=' + get_edit_branch();
    console.log(base_url);
  } else {
    base_url += 'draft?filename=' + get_filename() + '&value=' + encodeURIComponent(post_matter) + '&message=' + encodeURIComponent(commit_msg) + '&description=' + encodeURIComponent(commit_desc) + '&target_branch=' + get_edit_branch();
  }
  return base_url;
}


function get_venue_info(id, el){
  // If Venue is not checked
  if ($('#block-venue input').is(':checked') == false) {
    // hide the venue fields
    $('#block-'+id).addClass('display-none');
    return 'skip';
  } else {
    // show the venue fields
    $('#block-'+id).removeClass('display-none');
    return el.val();
  }
}


function slugify() {
  var base = $('#block-'+base_field +' input').val();
  var small_words = /\band |\bthe |\bare |\bis |\bof |\bto /gi;
  var slug = base.replace(new RegExp(small_words, "gi"), '');
  var output = slug.split(" ").splice(0,6).join(" ");
  output = output.replace(/[^a-zA-Z0-9\s]/g, "");
  output = output.toLowerCase();
  output = output.replace(/\s\s+/g, " ");
  output = output.trim();
  output = output.replace(/\s/g, "-");
  return output;
}

function encodeEntities(input) {
  var entityPattern = /[&<>"'’`)(=+*@$%\/]/g;

  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    "’": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
    '*': '&#42;',
    '$': '&#36;',
    '%': '&#37;',
    '(': '&#40;',
    ')': '&#41;',
    '+': '&#43;',
    '@': '&#64;',
    '-': '&#8208;',
    '–': '&#8211;',
    '—': '&#8212;'
  };
  input.replace(entityPattern, function (s) {
    return entityMap[s];
  });
}

function update_date(date){
  // Get date — set to +1 date in the future
  var yearmoday = `${date.getFullYear()}-${('0' + (date.getMonth()+1)).slice(-2)}-${('0' + (date.getDate()+1)).slice(-2)}`;

  // Get current time — not being used at the moment
  var time = `${date.getHours()+1}:${(date.getMinutes()<10?'0':'') + '00:00'}`;
  var time_end = `${date.getHours()+2}:${(date.getMinutes()<10?'0':'') + '00:00'}`;
  // Set time to 9am ET — our daily pub time
  // var time = '09:00';

  // Insert the time into the time fields
  $("#block-date input, #block-date-end input").val(yearmoday);
  $("#block-time input").val(time);
  $("#block-time-end input").val(time_end);
}

jQuery(document).ready(function ($) {

});

jQuery(document).ready(function ($) {


});
