using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Identity;
using Newtonsoft.Json;
using zwajapp_api.Models;

namespace zwajapp_api.Data
{
    public class TrailData
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        public TrailData(UserManager<User> user, RoleManager<Role> roleManager)
        {
            _roleManager = roleManager;
            _userManager = user;
        }
        public void TrailUsers()
        {
            if (!_userManager.Users.Any())
            {
                var userData = System.IO.File.ReadAllText("Data/UseTrialData.json");
                var users = JsonConvert.DeserializeObject<List<User>>(userData);

                // اضافة الرتب 
                var roles = new List<Role>{
                    new Role{Name = "Admin"},
                    new Role{Name = "Moderator"},
                    new Role { Name = "Member"},
                    new Role{Name="VIP"}
                };
                // اضافتها لكل الاعضاء 
                foreach (var role in roles)
                {
                    _roleManager.CreateAsync(role).Wait();
                }
                //  انشاء الاعضاء وكل الاعضاء لها رتبة ال Member
                foreach (var user in users)
                {
                    // user.Photos.ToList().ForEach(p=>p.IsApproved=true);
                    _userManager.CreateAsync(user, "password").Wait();
                    _userManager.AddToRoleAsync(user, "Member").Wait();
                }
                // انشاء رتبة ال Admin
                var adminUser = new User
                {
                    UserName = "Admin"
                };

                // عمل العضو Amin
                IdentityResult result = _userManager.CreateAsync(adminUser, "password").Result;
                var admin = _userManager.FindByNameAsync("Admin").Result;
                // اضافه رتبتين لل Admin
                _userManager.AddToRolesAsync(admin, new[] { "Admin", "Moderator" }).Wait();

            }
        }
    }
}