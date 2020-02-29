using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
// using AutoMapper.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using zwajapp_api.Data;
using zwajapp_api.Dtos;
using zwajapp_api.Models;

namespace zwajapp_api.Controllers {
    [AllowAnonymous]
    [ApiController]
    [Route ("[Controller]")]
    public class AuthController : ControllerBase {
        private readonly IAuthRepository _repo;
        private readonly IMapper _mapper;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _config;
        public AuthController (IAuthRepository repo, IMapper mapper, IConfiguration config, UserManager<User> userManager, SignInManager<User> signInManager) {
            _config = config;
            _signInManager = signInManager;
            _userManager = userManager;
            _mapper = mapper;
            _repo = repo;
        }

        [HttpPost ("register")]
        public async Task<IActionResult> Register (UserForRegisterDto userForRegisterDto) {
            var userToCreate = _mapper.Map<User>(userForRegisterDto);
            var result = await _userManager.CreateAsync(userToCreate,userForRegisterDto.Password);
            var userToReturn = _mapper.Map<UserForDetailsDto>(userToCreate);
            if(result.Succeeded){
                return CreatedAtRoute("GetUser", new { controller = "User", id = userToCreate.Id }, userToReturn);
            }
            return BadRequest(result.Errors);
        }
        private async Task<string> GenerateJwtToken (User user) {
            // السيرفير يطالب بال Id , username 
            // ويحتفظ بهم في Claim
            var claims = new List<Claim> {
                new Claim (ClaimTypes.NameIdentifier, user.Id.ToString ()),
                new Claim (ClaimTypes.Name, user.UserName)
            };

            // اضافة ال  Roles الي JwtToken
            var roles = await _userManager.GetRolesAsync (user);
            foreach (var role in roles) {
                claims.Add (new Claim (ClaimTypes.Role, role));
            }

            // بناء ال Secret or key ويولد البيانات بشكل عشوائي
            var key = new SymmetricSecurityKey (Encoding.UTF8.GetBytes (_config.GetSection ("AppSettings:Token").Value));

            // بناء شهاده الدخول المسجله ع السيرفير
            var creds = new SigningCredentials (key, SecurityAlgorithms.HmacSha512);
            var tokenDescriptor = new SecurityTokenDescriptor {
                Subject = new ClaimsIdentity (claims),
                Expires = DateTime.Now.AddDays (1),
                SigningCredentials = creds
            };

            //  نهاية عمل التوكن وارجاع القيم 
            var tokenHandler = new JwtSecurityTokenHandler ();
            var token = tokenHandler.CreateToken (tokenDescriptor);
            return tokenHandler.WriteToken (token);
        }

        [HttpPost ("login")]
        public async Task<IActionResult> Login (UserForLoginDto userForLoginDto) {
            var user = await _userManager.FindByNameAsync (userForLoginDto.UserName);
            var result = await _signInManager.CheckPasswordSignInAsync (user, userForLoginDto.Password, false);
            if (result.Succeeded) {
                var appUser = await _userManager.Users.Include (p => p.Photos).FirstOrDefaultAsync (
                    u => u.NormalizedUserName == userForLoginDto.UserName.ToUpper ()
                );
                var userToReturn = _mapper.Map<UserForListDto>(appUser);

                return Ok (new {
                    token = GenerateJwtToken (appUser).Result,
                        user = userToReturn
                });
            }
            return Unauthorized ();
        }

    }
}