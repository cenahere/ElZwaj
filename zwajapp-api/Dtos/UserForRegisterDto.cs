using System;
using System.ComponentModel.DataAnnotations;

namespace zwajapp_api.Dtos {
    public class UserForRegisterDto {
        [Required]
        public string UserName { get; set; }

        [Required]
        [StringLength (8, MinimumLength = 4, ErrorMessage = "كلمة المرور لا تقل عن اربعة حروف ولا تزيد عن ثمانية")]
        public string Password { get; set; }
        public string Gender { get; set; }

        [Required]

        public string KnownAs { get; set; }

        [Required]

        public DateTime DateOfBirth { get; set; }

        [Required]

        public string City { get; set; }

        [Required]

        public string Country { get; set; }

        [Required]

        public DateTime Created { get; set; }

        [Required]

        public DateTime LastActive { get; set; }
        public UserForRegisterDto () {
            Created = DateTime.Now;
            LastActive = DateTime.Now;
        }
    }
}