// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyAN8LT8qUc_m0wzor5dqthUZXB5X7Vkl5k",
    authDomain: "a-day-in-my-life-f793c.firebaseapp.com",
    databaseURL: "https://a-day-in-my-life-f793c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "a-day-in-my-life-f793c",
    storageBucket: "a-day-in-my-life-f793c.appspot.com",
    messagingSenderId: "460147210239",
    appId: "1:460147210239:web:fce928bb3a3456bde799ca",
    measurementId: "G-TEBCL36MSL"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the Firestore service
var db = firebase.firestore();

$(document).ready(function () {
    $('a.nav-link').on('click', function () {
        $('a.nav-link').removeClass('active');
        $(this).addClass('active');
    });
    // Smooth scrolling when clicking on a link with a hash
    $('a[href^="#"]').on('click', function (event) {
        var target = $(this.getAttribute('href'));
        if (target.length) {
            event.preventDefault();
            $('html, body').stop().animate({
                scrollTop: target.offset().top
            }, 800); // Adjust the animation speed as needed
        }
    });

    function updateClock() {
        var now = moment();
        var time = now.format('D MMMM YYYY H:mm:ss A');
        $('#clock').text(time);

        var hour = now.hours();
        var greeting;

        if (hour >= 0 && hour < 5) {
            greeting = 'Good Night 🌙🌠😴';
        } else if (hour >= 5 && hour < 12) {
            greeting = 'Good Morning 🌞😊☕️';
        } else if (hour >= 12 && hour < 18) {
            greeting = 'Good Afternoon 🌤️🕒🍵';
        } else {
            greeting = 'Good Evening 🌃🌟🌠';
        }

        $('#greeting').text(greeting);
    }

    setInterval(updateClock, 1000);

    // Function to generate a card HTML string based on the document data
    // Function to generate a card HTML string based on the document data
    // Function to generate a card HTML string based on the document data
    function generateCardHTML(doc) {
        var uniqueId = doc.date.replace(/ /g, '-') + '-' + doc.id;
        var cardHTML = `
    <div class="col-md-3">
        <div class="card">
            <img class="card-img-top" src="${doc.imageURL}" alt="Card Image">
            <div class="card-body">
                <h5 class="card-title">${doc.date}</h5>
                <p class="card-text">${doc.title}</p>
                <a href="#" class="btn btn-primary read-more-btn" data-toggle="modal" data-target="#contentModal${uniqueId}">Read More</a>
                <p class="additional-notes">${doc.additionalNote}</p>
            </div>
        </div>
    </div>
    `;
        return cardHTML;
    }

    // Function to generate a modal HTML string based on the document data
    function generateModalHTML(doc) {
        var uniqueId = doc.date.replace(/ /g, '-') + '-' + doc.id;
        var formattedAdditionalNote = doc.additionalNote.replace(/\n/g, '<br>'); // Replace newlines with <br> tags
        var modalHTML = `
    <div class="modal fade" id="contentModal${uniqueId}">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${doc.date}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <img class="cardImageModal" src="${doc.imageURL}" class="img-fluid rounded-left"
                                alt="${doc.title}">
                        </div>
                        <div class="col-md-6">
                            <div class="scrollable-text">
                                <p class="cardText">${doc.title}</p>
                                <p>${formattedAdditionalNote}</p>
                                <!-- Use the formatted additional note with preserved line breaks -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
        `;
        return modalHTML;
    }



    // Function to display a loader while the data is being fetched
    // Function to display the content loader
    function showLoader() {
        var loaderHTML = `
            <div class="content-loader">
                <div class="loader">
                    <div class="spinner-border" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
            </div>
        `;
        $('#cardRow').html(loaderHTML);
    }

    // Function to hide the content loader
    function hideLoader() {
        $('#cardRow .content-loader').remove();
    }

    // Function to handle the fetched documents and generate cards
    function handleFetchedDocuments(snapshot) {
        snapshot.forEach(function (doc) {
            var cardHTML = generateCardHTML(doc.data());
            var modalHTML = generateModalHTML(doc.data());

            $('#cardRow').append(cardHTML);
            $('body').append(modalHTML);
        });
    }

    // Fetch the documents from Firestore and generate cards
    function fetchDocumentsAndGenerateCards() {
        showLoader();

        db.collection('content')
            .orderBy('date', 'asc') // Sort the documents by the 'date' field in ascending order
            .get()
            .then(function (snapshot) {
                hideLoader();
                handleFetchedDocuments(snapshot);
            })
            .catch(function (error) {
                hideLoader();
                console.error('Error fetching documents: ', error);
            });
    }


    // Call the fetchDocumentsAndGenerateCards function when the page loads
    fetchDocumentsAndGenerateCards();

    $('#newContentForm').submit(function (event) {
        event.preventDefault();

        var date = $('#contentDate').val();
        var formattedDate = moment(date).format('D MMMM - YYYY');
        var title = $('#contentTitle').val();
        var additionalNote = $('#contentAdditionalNote').val();

        var file = $('#contentImage')[0].files[0];

        // Generate a unique key for the content
        var contentDocRef = db.collection('content').doc();

        // Store data in Firestore
        contentDocRef.set({
            date: formattedDate,
            title: title,
            additionalNote: additionalNote
        })
            .then(function () {
                // Upload image to Firebase Storage
                var storageRef = firebase.storage().ref('images/' + contentDocRef.id);
                var uploadTask = storageRef.put(file);

                uploadTask.on('state_changed',
                    function (snapshot) {
                        // Track upload progress if needed
                    },
                    function (error) {
                        console.error('Error uploading image:', error);
                    },
                    function () {
                        // Upload complete, get the download URL
                        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                            // Store the image URL in Firestore
                            contentDocRef.update({
                                imageURL: downloadURL
                            })
                                // Create the card and modal elements with the appropriate data and image URL
                                .then(function () {
                                    // Create the card and modal elements with the appropriate data and image URL
                                    var newCard = `
            <div class="col-md-3">
              <div class="card">
                <img class="card-img-top" src="${downloadURL}" alt="Card Image">
                <div class="card-body">
                  <h5 class="card-title">${formattedDate}</h5>
                  <p class="card-text">${title}</p>
                  <a href="#" class="btn btn-primary read-more-btn" data-toggle="modal" data-target="#contentModal${formattedDate.replace(/ /g, '-')}">Read More</a>
                  <p class="additional-notes">${additionalNote}</p>
                </div>
              </div>
            </div>
          `;

                                    var modalHTML = `
            <div class="modal fade" id="contentModal${formattedDate.replace(/ /g, '-')}">
              <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">${formattedDate}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                    <div class="row">
                      <div class="col-md-6">
                        <img class="cardImageModal" src="${downloadURL}" class="img-fluid rounded-left" alt="${title}">
                      </div>
                      <div class="col-md-6">
                        <div class="scrollable-text">
                          <p class="cardText">${title}</p>
                          <p>${additionalNote}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;

                                    // Append the new card and modal elements to the page
                                    $('#cardRow').append(newCard);
                                    $('body').append(modalHTML);

                                    // Reset the form and close the modal
                                    $('#newContentForm')[0].reset();
                                    $('#addContentModal').modal('hide');
                                })
                                .catch(function (error) {
                                    console.error('Error updating document with image URL:', error);
                                });
                        });
                    }
                );
            })
            .catch(function (error) {
                console.error('Error writing document: ', error);
            });
    });
});