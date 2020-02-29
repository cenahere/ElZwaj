using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace zwajapp_api.Models
{
    public class Role : IdentityRole<int>
    {
        public ICollection<UserRole> UserRoles { get; set; }
        
    }
}