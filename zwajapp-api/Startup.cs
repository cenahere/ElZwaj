using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using zwajapp_api.Data;
using zwajapp_api.Helpers;
using zwajapp_api.Models;
using ZwajApp.API.Helpers;
using Stripe;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using DinkToPdf.Contracts;
using DinkToPdf;

namespace zwajapp_api {
    public class Startup {
        public Startup (IConfiguration configuration) {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices (IServiceCollection services) {
            services.AddControllers ().AddNewtonsoftJson (x => x.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);

            services.AddDbContext<DataContext> (x => x.UseSqlite (Configuration.GetConnectionString ("DefaultConnection")));

            services.AddScoped<IAuthRepository, AuthRepository> ();
            services.AddScoped<IZwajRepostiory, ZwajRepository> ();

             services.AddAutoMapper ();
            // Mapper.Reset();

            
            IdentityBuilder builder = services.AddIdentityCore<User> (opt => {
                opt.Password.RequireDigit = false;
                opt.Password.RequiredLength = 4;
                opt.Password.RequireLowercase = false;
                opt.Password.RequireNonAlphanumeric = false;
                opt.Password.RequireUppercase = false;
            });
            builder = new IdentityBuilder (builder.UserType, typeof (Role), builder.Services);
            builder.AddEntityFrameworkStores<DataContext> ();
            builder.AddRoleValidator<RoleValidator<Role>> ();
            builder.AddRoleManager<RoleManager<Role>> ();
            builder.AddSignInManager<SignInManager<User>> ();

            services.AddAuthentication (JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer (Options => {
                    Options.TokenValidationParameters = new TokenValidationParameters {
                    ValidateIssuerSigningKey = true, // التوكن اللي جاي من ال Client
                    IssuerSigningKey = new SymmetricSecurityKey (Encoding.ASCII.GetBytes (Configuration.GetSection ("AppSettings:Token").Value)), // الحصول علي التوكن
                    ValidateIssuer = false, // الصادر للتوكن
                    ValidateAudience = false // المستقبل للتوكن 

                    };
                });

            services.AddTransient<TrailData> ();
            services.TryAddSingleton<ISystemClock, SystemClock> ();
            services.AddCors ();

            services.Configure<CloudinarySettings> (Configuration.GetSection ("CloudinarySettings"));
            services.AddScoped<LogUserActivity> ();

            services.AddSignalR ();

            services.Configure<StripeSettings>(Configuration.GetSection("Stripe:Secretkey"));

            services.AddAuthorization(
                options=>{
                    options.AddPolicy("RequireAdminRole",policy=>policy.RequireRole("Admin"));
                    options.AddPolicy("ModeratorPhotoRole",policy=>policy.RequireRole("Admin","Moderator"));
                    options.AddPolicy("VipOnly",policy=>policy.RequireRole("VIP"));
                }
            );

            services.AddMvc(options=>{
                var policy = new AuthorizationPolicyBuilder()
                            .RequireAuthenticatedUser()
                            .Build();
                options.Filters.Add(new AuthorizeFilter(policy));
            }).SetCompatibilityVersion(CompatibilityVersion.Version_3_0);
            /*
            addSingleTon: تضيف خدمة بربط نوع معين من الانترفيس والكلاس المسئول عن تنفيذه
            Iconverter: الانترفيس التابعة ل dinkToPdf
            new PdfTolls : الكلاس المسئول عن التنفيذ
            */
            services.AddSingleton(typeof(IConverter),new SynchronizedConverter(new PdfTools()));

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure (IApplicationBuilder app, IWebHostEnvironment env, TrailData trailData) {

            StripeConfiguration.SetApiKey(Configuration.GetSection("Stripe:SecretKey").Value);

            if (env.IsDevelopment ()) {
                app.UseDeveloperExceptionPage ();
            } else {
                app.UseExceptionHandler (BuilderExtensions => {
                    BuilderExtensions.Run (async context => {
                        context.Response.StatusCode = (int) HttpStatusCode.InternalServerError;
                        var error = context.Features.Get<IExceptionHandlerFeature> ();
                        if (error != null) {
                            context.Response.AddApplicationError (error.Error.Message);
                            await context.Response.WriteAsync (error.Error.Message);
                        }
                    });
                });
            }

            //app.UseHttpsRedirection();

            app.UseRouting ();

            // trailData.TrailUsers();
            app.UseCors (x => x.SetIsOriginAllowed (options => _ = true).AllowAnyMethod ().AllowAnyHeader ().AllowCredentials ());

            app.UseAuthentication ();

            app.UseAuthorization ();

            app.UseEndpoints (endpoints => {
                endpoints.MapControllers ();

                endpoints.MapHub<ChatHub> ("/chat");

            });
        }
    }
}