Vue.createApp({
    data() {
        return {
            csrf: token,
            isLoading: false,
            image: null,
            previewImage: null,
            level: null,
            progress: 0,
            status: '',
            predictions: []
        }
    },
    delimiters: ['[[', ']]'],
    methods: {
        async onSubmit(){
            if(!this.image){
                Swal.fire({
                    icon: "warning",
                    text: "Pilih gambar dahulu!",
                    timer: 2000,
                    showConfirmButton: false,
                })
            } else {
                this.isLoading = true
                this.progress = 0
                this.status = 'Uploading...'

                await axios.postForm('/detection/', {'image': this.image}, { 
                    headers: { "X-CSRFToken": this.csrf },
                    onUploadProgress: (progressEvent) => {
                        this.progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    }
                })
                .then((result) => {
                    this.status = 'Identification...'
                    setTimeout(() => {
                        this.isLoading = false
                        if(result.data.status){
                            this.level = result.data.results.level
                            this.predictions = result.data.results.predictions
                        } else {
                            Swal.fire({
                                icon: "warning",
                                text: result.data.message,
                                timer: 2000,
                                showConfirmButton: false,
                            })
                        }
                    }, 5000);
                })
            }
        },
        fileHandler(e){
            this.previewImage = null
            this.image = null
            this.level = null
            this.predictions.length = 0
            this.progress = 0

            const file = e.target.files[0]
            if(file) {
                this.image = file
                this.previewImage = URL.createObjectURL(file)
            }
        },
        startLoading() {
            this.isLoading = true;
            this.progress = 0;

            // Mulai loading progressif di sini
            const interval = setInterval(() => {
                this.progress += 10;
                if (this.progress >= 100) {
                    clearInterval(interval);
                    this.isLoading = false;
                }
            }, 500);
        }
    },
    computed: {
        getResult(){
            if(this.level){
                result = {'level': null, 'description': null}

                if(this.level == 'light'){
                    result['level'] = "Light Roast"
                    result['description'] = "Untuk mereka yang menyukai kopi dengan tekstur mirip seperti teh dan karakteristik lembut, light roast adalah tingkat sangrai yang cocok. Kamu bisa memeriksa biji kopi yang dibeli untuk mengetahui tingkatannya. Biji kopi yang disangrai secara light umumnya bukan hanya akan terlihat seperti “versi paling muda” dari warna coklat kopi, tapi juga tidak ada kilau minyak yang terlalu kelihatan di permukaan biji kopi."
                } else if(this.level == 'light-medium'){
                    result['level'] = "Light Medium Roast"
                    result['description'] = "Untuk mereka yang menyukai kopi dengan tekstur mirip seperti teh dan karakteristik lembut, light roast adalah tingkat sangrai yang cocok. Kamu bisa memeriksa biji kopi yang dibeli untuk mengetahui tingkatannya. Biji kopi yang disangrai secara light umumnya bukan hanya akan terlihat seperti “versi paling muda” dari warna coklat kopi, tapi juga tidak ada kilau minyak yang terlalu kelihatan di permukaan biji kopi."
                } else if(this.level == 'medium'){
                    result['level'] = "Medium Roast"
                    result['description'] = "Teksturnya sedikit mirip teh dan setingkat lebih “tanned” dari light roast. Hampir sama seperti light roast, jika melihat biji kopi yang disangrai dalam level ini, maka kita pun tidak akan menemukan minyak kopi yang terlalu kentara pada bijinya. Namun jika kamu mencoba dua kopi seduhan ala manual brew yang masing-masing disangrai dengan light dan medium, maka kamu akan merasakan perbedaannya. Kopi yang disangrai dalam level medium cenderung memiliki rasa yang lebih intens dibandingkan dengan light, tapi kadarnya tetap tidak sekuat dark roast. Karena ia mampu menghadirkan rasa dan komposisi yang pas, tidak heran kalau level roasting ini pun cukup popular di banyak roaster."
                } else if(this.level == 'medium-dark'){
                    result['level'] = "Medium Dark Roast"
                    result['description'] = "Selanjutnya dalam spektrum rasa kopi adalah level medium-dark. Ini adalah tingkatan yang akan menghadirkan body lebih heavy dan lebih intens pada kopi. Biji yang disangrai dalam level ini cenderung sudah memiliki tampilan kemilau minyak pada permukaan biji kopi. Ketika diseduh pun rasanya sudah lebih membentuk karakter pahit-manis yang nikmat."
                } else {
                    result['level'] = "Dark Roast"
                    result['description'] = "Kopi-kopi dark roast (dan level di atasnya semacam Italian, Vienna atau French roast), umumnya dilakukan jika kopi tersebut akan ditambahkan lagi dengan campuran susu, gula dan sebagainya menjadi entah cappuccino, latte, flat white dan sebagainya. Jarang sekali kopi seduh manual, alias manual brew, yang menggunakan level sangrai ini. Kopi dark roast pada dasarnya hampir tidak lagi menyimpan karakter apapun selain rasa gosong dan pahit yang hangus. Sekiranya pun ada karakter asli tersisa, itu pun sudah sangat sedikit sekali. Keunggulan kopi dark roasted ini, menurut saya, terlerak pada aromanya yang wangi dan harum begitu diseduh dengan air panas."
                }

                return result
            } else {
                return "Ada yang error"
            }
        }
    }
}).mount('#app');