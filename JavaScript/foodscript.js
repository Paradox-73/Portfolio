$(document).ready(function() {
  $('.item button').on('click', function() {
    var itemName = $(this).closest('.item').find('.item__name').text();
    $('#menu-cart').text($('#menu-cart').text() + ' ' + '\n' + itemName+ ' '+ '\n');
  });
});
$(document).ready(function() {
    $('.menu-cart').on('click', function() {
      var $this = $(this);
      if ($this.data('original-text') === undefined) {
        $this.data('original-text', $this.text());
      }
      var newText = 'Told you I only cook for myself';
      if ($this.text() === newText) {
        $this.text($this.data('original-text'));
      } else {
        $this.text(newText);
      }
    });
  });
  